//! Generate the standard-library snapshot using this executable's Salsa schema.

impl super::flags::GenerateStdCache {
    pub fn run(self) -> anyhow::Result<()> {
        crate::semantic_cache::generate(&self.project, &self.output, self.benchmark_codecs)
    }
}
