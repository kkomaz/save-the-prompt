-- Insert predefined chains into the chains table
INSERT INTO chains (id, name, created_at) VALUES
  (uuid_generate_v4(), 'Ethereum', NOW()),
  (uuid_generate_v4(), 'Optimism', NOW()),
  (uuid_generate_v4(), 'Binance Smart Chain (BSC)', NOW()),
  (uuid_generate_v4(), 'Gnosis', NOW()),
  (uuid_generate_v4(), 'Polygon', NOW()),
  (uuid_generate_v4(), 'Sonic', NOW()),
  (uuid_generate_v4(), 'zkSync', NOW()),
  (uuid_generate_v4(), 'Metis', NOW()),
  (uuid_generate_v4(), 'Kava EVM', NOW()),
  (uuid_generate_v4(), 'Base', NOW()),
  (uuid_generate_v4(), 'IOTA EVM', NOW()),
  (uuid_generate_v4(), 'Avalanche', NOW()),
  (uuid_generate_v4(), 'Arbitrum', NOW()),
  (uuid_generate_v4(), 'Scroll', NOW()),
  (uuid_generate_v4(), 'Solana', NOW());