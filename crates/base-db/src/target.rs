//! Information about the target.

use std::fmt;

use triomphe::Arc;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum Arch {
    // Only what we need is present here.
    Wasm32,
    Wasm64,
    Other,
}

#[derive(Debug, PartialEq, Eq, Hash, Clone, serde::Serialize, serde::Deserialize)]
pub struct TargetData {
    pub data_layout: Box<str>,
    pub arch: Arch,
}

#[derive(Clone, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub struct TargetLoadError(
    #[serde(serialize_with = "serialize_error", deserialize_with = "deserialize_error")] Arc<str>,
);

fn serialize_error<S: serde::Serializer>(
    text: &Arc<str>,
    serializer: S,
) -> Result<S::Ok, S::Error> {
    serializer.serialize_str(text)
}

fn deserialize_error<'de, D: serde::Deserializer<'de>>(
    deserializer: D,
) -> Result<Arc<str>, D::Error> {
    let text = <String as serde::Deserialize>::deserialize(deserializer)?;
    Ok(Arc::from(text.as_str()))
}

impl fmt::Debug for TargetLoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Debug::fmt(&self.0, f)
    }
}

impl fmt::Display for TargetLoadError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        fmt::Display::fmt(&self.0, f)
    }
}

impl std::error::Error for TargetLoadError {}

impl From<String> for TargetLoadError {
    fn from(value: String) -> Self {
        Self(value.into())
    }
}

impl From<&str> for TargetLoadError {
    fn from(value: &str) -> Self {
        Self(value.into())
    }
}

pub type TargetLoadResult = Result<TargetData, TargetLoadError>;
