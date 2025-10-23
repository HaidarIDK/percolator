pub mod initialize;
pub mod commit_fill;

pub use initialize::*;
pub use commit_fill::*;

/// Instruction discriminator
#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SlabInstruction {
    /// Initialize slab
    Initialize = 0,
    /// Commit fill (v0 - single instruction for fills)
    CommitFill = 1,
}
