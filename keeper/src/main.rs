//! Percolator Liquidation Keeper
//!
//! Off-chain service that monitors portfolio health and triggers liquidations
//! for undercollateralized users.

mod config;
mod health;
mod priority_queue;
mod tx_builder;

use anyhow::{Context, Result};
use config::Config;
use priority_queue::{HealthQueue, UserHealth};
use solana_client::rpc_client::RpcClient;
use solana_sdk::{
    commitment_config::CommitmentConfig,
    pubkey::Pubkey,
    signature::{Keypair, Signer},
};
use std::time::Duration;
use tokio::time;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    log::info!("Starting Percolator Liquidation Keeper");

    // Load configuration
    let config = Config::load().unwrap_or_else(|_| {
        log::warn!("Failed to load config, using default devnet config");
        Config::default_devnet()
    });

    log::info!("Connected to RPC: {}", config.rpc_url);
    log::info!("Monitoring router program: {}", config.router_program);

    // Initialize RPC client
    let client = RpcClient::new_with_commitment(
        config.rpc_url.clone(),
        CommitmentConfig::confirmed(),
    );

    // Load keeper wallet
    let keeper = load_keypair(&config.keypair_path)?;
    log::info!("Keeper wallet: {}", keeper.pubkey());

    // Initialize health queue
    let mut queue = HealthQueue::new();

    log::info!("Keeper service started. Monitoring for liquidations...");

    // Main event loop
    let mut interval = time::interval(Duration::from_secs(config.poll_interval_secs));

    loop {
        interval.tick().await;

        // Process liquidations
        if let Err(e) = process_liquidations(&mut queue, &client, &config, &keeper).await {
            log::error!("Error processing liquidations: {}", e);
        }

        // Log queue status
        if !queue.is_empty() {
            log::debug!("Health queue size: {}", queue.len());

            if let Some(worst) = queue.peek() {
                log::debug!("Worst health: {}", worst.health as f64 / 1e6);
            }
        }
    }
}

/// Process liquidations for users in the queue
async fn process_liquidations(
    queue: &mut HealthQueue,
    client: &RpcClient,
    config: &Config,
    keeper: &Keypair,
) -> Result<()> {
    // Get liquidatable users
    let liquidatable = queue.get_liquidatable(config.liquidation_threshold);

    if liquidatable.is_empty() {
        log::debug!("No users need liquidation");
        return Ok(());
    }

    log::info!("Found {} users needing liquidation", liquidatable.len());

    // Process up to max batch size
    let batch_size = config.max_liquidations_per_batch.min(liquidatable.len());

    for user_health in liquidatable.iter().take(batch_size) {
        log::info!(
            "Liquidating user {} (health: {})",
            user_health.user,
            user_health.health as f64 / 1e6
        );

        // Determine if pre-liquidation or hard liquidation
        let is_preliq = user_health.health > 0 && user_health.health < config.preliq_buffer;

        // Build and submit liquidation transaction
        match execute_liquidation(
            client,
            config,
            keeper,
            &user_health.portfolio,
            is_preliq,
        ) {
            Ok(signature) => {
                log::info!("Liquidation submitted: {}", signature);

                // Remove from queue
                queue.remove(&user_health.user);
            }
            Err(e) => {
                log::error!(
                    "Failed to liquidate user {}: {}",
                    user_health.user,
                    e
                );
            }
        }
    }

    Ok(())
}

/// Execute a single liquidation
fn execute_liquidation(
    client: &RpcClient,
    config: &Config,
    keeper: &Keypair,
    portfolio: &Pubkey,
    is_preliq: bool,
) -> Result<String> {
    // For v0, this is a stub
    // In production, this would:
    // 1. Fetch recent blockhash
    // 2. Get registry and vault addresses
    // 3. Build liquidation transaction
    // 4. Submit to cluster
    // 5. Wait for confirmation

    log::debug!(
        "Would execute {} liquidation for portfolio {}",
        if is_preliq { "pre" } else { "hard" },
        portfolio
    );

    // Stub: return fake signature
    Ok("stub_signature".to_string())
}

/// Load keeper keypair from file
fn load_keypair(path: &str) -> Result<Keypair> {
    let expanded_path = shellexpand::tilde(path);
    let bytes = std::fs::read(expanded_path.as_ref())
        .context(format!("Failed to read keypair from {}", path))?;

    let keypair = if bytes[0] == b'[' {
        // JSON format
        let json_data: Vec<u8> = serde_json::from_slice(&bytes)
            .context("Failed to parse keypair JSON")?;
        Keypair::try_from(&json_data[..])
            .context("Failed to create keypair from bytes")?
    } else {
        // Binary format
        Keypair::try_from(&bytes[..])
            .context("Failed to create keypair from bytes")?
    };

    Ok(keypair)
}

/// Fetch portfolio accounts and update health queue (stub for v0)
#[allow(dead_code)]
async fn update_health_queue(
    queue: &mut HealthQueue,
    client: &RpcClient,
    _config: &Config,
) -> Result<()> {
    // For v0, this is a stub
    // In production, this would:
    // 1. Query all portfolio accounts via getProgramAccounts
    // 2. Fetch oracle prices
    // 3. Calculate health for each portfolio
    // 4. Update queue

    log::debug!("Health queue update (stub)");

    // Example: add a dummy user for testing
    let dummy_user = UserHealth {
        user: Pubkey::new_unique(),
        portfolio: Pubkey::new_unique(),
        health: -5_000_000, // Below MM
        equity: 95_000_000,
        mm: 100_000_000,
        last_update: 0,
    };

    queue.push(dummy_user);

    Ok(())
}
