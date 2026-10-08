//! Regression for the semantic (rather than source-text) persistence boundary.

use std::sync::{Arc, Mutex};

use base_db::{SourceDatabase, all_crates};
#[cfg(feature = "cache-item-trees")]
use hir::db::DefDatabase;
use test_fixture::WithFixture;

use crate::RootDatabase;

const CORE: &str = r#"
//- /core/lib.rs crate:core library new_source_root:library
#![no_core]
pub struct Sentinel;
#[macro_export]
macro_rules! make_type { () => { pub struct Generated; }; }
make_type!();
"#;

#[test]
#[cfg(feature = "cache-item-trees")]
fn restored_std_item_tree_does_not_lower_again() {
    let mut warm = RootDatabase::with_files(CORE);
    let core = all_crates(&warm)[0];
    let expected = warm
        .file_item_tree(core.root_file_id(&warm).into(), core)
        .pretty_print(&warm, core.data(&warm).edition);
    let bytes = warm.serialize_cache().unwrap();
    let events = Arc::new(Mutex::new(Vec::new()));
    let recorded = Arc::clone(&events);
    let restored = RootDatabase::deserialize_cache_with_events(
        &bytes,
        Some(Box::new(move |event| recorded.lock().unwrap().push(event))),
    )
    .unwrap();
    let core = all_crates(&restored)[0];
    let actual = restored
        .file_item_tree(core.root_file_id(&restored).into(), core)
        .pretty_print(&restored, core.data(&restored).edition);
    assert_eq!(expected, actual);
    let executions = events
        .lock()
        .unwrap()
        .iter()
        .filter(|event| match event.kind {
            salsa::EventKind::WillExecute { database_key } => (&restored as &dyn salsa::Database)
                .ingredient_debug_name(database_key.ingredient_index())
                .contains("file_item_tree_query"),
            _ => false,
        })
        .count();
    assert_eq!(executions, 0, "restoring std must reuse the lowered ItemTree");
}

#[test]
fn restored_module_can_validate_its_creator_after_a_revision_change() {
    use salsa::Database as _;
    let mut warm = RootDatabase::with_files(CORE);
    let core = all_crates(&warm)[0];
    let module = hir::crate_def_map(&warm, core).root;
    let bytes = warm.serialize_cache().unwrap();
    let mut restored = RootDatabase::deserialize_cache(&bytes).unwrap();
    restored.synthetic_write(salsa::Durability::MEDIUM);
    assert_eq!(module.krate(&restored), core);
}

#[test]
#[cfg(feature = "cache-item-trees")]
fn restored_macro_item_tree_validates_without_reentering_name_resolution_first() {
    use salsa::Database as _;
    let mut warm = RootDatabase::with_files(CORE);
    let core = all_crates(&warm)[0];
    let map = hir::crate_def_map(&warm, core);
    let call = *map[map.root].scope.iter_macro_invoc().next().unwrap().1;
    let bytes = warm.serialize_cache().unwrap();
    let mut restored = RootDatabase::deserialize_cache(&bytes).unwrap();
    restored.synthetic_write(salsa::Durability::MEDIUM);
    let tree = restored.file_item_tree(call.into(), core);
    assert!(tree.pretty_print(&restored, core.data(&restored).edition).contains("Generated"));
}

#[test]
fn warmed_core_has_persisted_semantic_work() {
    let mut warm = RootDatabase::with_files(CORE);
    let core = all_crates(&warm)[0];
    let def_map = hir::crate_def_map(&warm, core);
    assert_eq!(def_map[def_map.root].scope.declarations().count(), 3);

    let serialized = warm.serialize_cache().unwrap();
    drop(warm);
    let events = Arc::new(Mutex::new(Vec::new()));
    let recorded = Arc::clone(&events);
    let restored = RootDatabase::deserialize_cache_with_events(
        &serialized,
        Some(Box::new(move |event| recorded.lock().unwrap().push(event))),
    )
    .unwrap();
    let core = all_crates(&restored)[0];
    assert!(
        restored.file_text(core.data(&restored).root_file_id).text(&restored).contains("Sentinel")
    );
    let def_map2 = hir::crate_def_map(&restored, core);
    assert_eq!(def_map2[def_map2.root].scope.declarations().count(), 3);
    let executed: Vec<_> = events
        .lock()
        .unwrap()
        .iter()
        .filter_map(|event| match event.kind {
            salsa::EventKind::WillExecute { database_key } => Some(
                (&restored as &dyn salsa::Database)
                    .ingredient_debug_name(database_key.ingredient_index())
                    .to_owned(),
            ),
            _ => None,
        })
        .collect();
    assert!(!executed.iter().any(|name| name.contains("crate_local_def_map")), "{executed:?}");
}

#[test]
fn restored_core_survives_workspace_loading_and_user_edits() {
    let mut warm = RootDatabase::with_files(CORE);
    hir::crate_def_map(&warm, all_crates(&warm)[0]);
    let bytes = warm.serialize_cache().unwrap();
    drop(warm);
    let events = Arc::new(Mutex::new(Vec::new()));
    let recorded = Arc::clone(&events);
    let mut restored = RootDatabase::deserialize_cache_with_events(
        &bytes,
        Some(Box::new(move |event| recorded.lock().unwrap().push(event))),
    )
    .unwrap();
    let fixture = format!(
        "{CORE}//- /main.rs crate:main deps:core new_source_root:local\n#![no_core]\nextern crate core;\nuse core::Sentinel;\ncore::make_type!();\nfn main() {{}}\n"
    );
    let cold = RootDatabase::with_files(&fixture);
    let cold_main = *all_crates(&cold).last().unwrap();
    let cold_map = hir::crate_def_map(&cold, cold_main);
    let cold_names: Vec<_> =
        cold_map[cold_map.root].scope.entries().map(|(name, _)| name.as_str()).collect();
    assert!(cold_names.contains(&"Generated"), "cold: {cold_names:?}");
    let change = test_fixture::ChangeFixture::parse(&fixture);
    change.change.apply(&mut restored);
    let main = *all_crates(&restored).last().unwrap();
    let map = hir::crate_def_map(&restored, main);
    let names: Vec<_> = map[map.root].scope.entries().map(|(name, _)| name.as_str()).collect();
    assert!(names.contains(&"Sentinel"), "{names:?}");
    assert!(names.contains(&"Generated"), "{names:?}");
    let executions = events
        .lock()
        .unwrap()
        .iter()
        .filter(|event| match event.kind {
            salsa::EventKind::WillExecute { database_key } => (&restored as &dyn salsa::Database)
                .ingredient_debug_name(database_key.ingredient_index())
                .contains("crate_local_def_map"),
            _ => false,
        })
        .count();
    assert_eq!(executions, 1, "only the new user crate should need name resolution");
    events.lock().unwrap().clear();
    let core = all_crates(&restored)[0];
    let user_file = main.data(&restored).root_file_id;
    restored
        .set_file_text(user_file, "#![no_core]\nuse core::Sentinel;\nfn main() { let _x = 1; }");
    hir::crate_def_map(&restored, core);
    assert!(
        !events
            .lock()
            .unwrap()
            .iter()
            .any(|event| matches!(event.kind, salsa::EventKind::WillExecute { .. }))
    );
}

#[test]
fn restored_std_ignores_builder_dependency_order() {
    let fixture = r#"
//- /core/lib.rs crate:core library new_source_root:library
#![no_core]
pub struct Core;
//- /alloc/lib.rs crate:alloc deps:core library new_source_root:library
#![no_core]
//- /std/lib.rs crate:std deps:alloc,core library new_source_root:library
#![no_core]
extern crate core;
pub use core::Core;
"#;
    let mut warm = RootDatabase::with_files(fixture);
    for &krate in all_crates(&warm).iter() {
        hir::crate_def_map(&warm, krate);
    }
    let bytes = warm.serialize_cache().unwrap();
    let events = Arc::new(Mutex::new(Vec::new()));
    let recorded = Arc::clone(&events);
    let mut restored = RootDatabase::deserialize_cache_with_events(
        &bytes,
        Some(Box::new(move |event| recorded.lock().unwrap().push(event))),
    )
    .unwrap();
    let mut change = test_fixture::ChangeFixture::parse(fixture).change;
    // The server combines workspaces with extend(), unlike the CLI loader.
    let mut combined = base_db::CrateGraphBuilder::default();
    combined.extend(change.source_change.crate_graph.take().unwrap(), &mut Default::default());
    change.set_crate_graph(combined);
    change.apply(&mut restored);
    for &krate in all_crates(&restored).iter() {
        hir::crate_def_map(&restored, krate);
    }
    let count = events
        .lock()
        .unwrap()
        .iter()
        .filter(|event| match event.kind {
            salsa::EventKind::WillExecute { database_key } => (&restored as &dyn salsa::Database)
                .ingredient_debug_name(database_key.ingredient_index())
                .contains("crate_local_def_map"),
            _ => false,
        })
        .count();
    assert_eq!(count, 0, "dependency ordering must not invalidate cached std name resolution");
}
