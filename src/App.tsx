import React, { useState } from 'react';
import { Copy, CopyCheck, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './utils';

type Prompt = {
  id: string;
  category: 'Staking/LSDs' | 'Lending & Borrowing';
  protocol: string;
  text: string;
  copied: boolean;
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([
    {
      id: '1',
      category: 'Staking/LSDs',
      protocol: 'Lido',
      text: 'Stake 1 ETH into stETH using Lido on Ethereum',
      copied: false,
    },
    {
      id: '2',
      category: 'Staking/LSDs',
      protocol: 'Marinade',
      text: 'Stake 50% of my Solana using Marinade',
      copied: false,
    },
    {
      id: '3',
      category: 'Staking/LSDs',
      protocol: 'Jito',
      text: 'Stake 10 SOL using Jito',
      copied: false,
    },
    {
      id: '4',
      category: 'Staking/LSDs',
      protocol: 'Beets Fi',
      text: 'Liquid stake 1000 $S with Beets to acquire stS',
      copied: false,
    },
    {
      id: '5',
      category: 'Staking/LSDs',
      protocol: 'Sanctum',
      text: 'Swap 0.5 SOL for JupSOL using Sanctum',
      copied: false,
    },
    {
      id: '6',
      category: 'Staking/LSDs',
      protocol: 'Sky',
      text: 'Deposit 1000 USDS to mint sUSDS using Sky',
      copied: false,
    },
    {
      id: '7',
      category: 'Lending & Borrowing',
      protocol: 'Aave',
      text: 'Supply 10 WETH to Aave on Arbitrum, then borrow 2000 USDC.',
      copied: false,
    },
    {
      id: '8',
      category: 'Lending & Borrowing',
      protocol: 'Spark',
      text: 'Deposit 1 WETH to Spark on Ethereum, then borrow 10% of the deposit in DAI.',
      copied: false,
    },
    {
      id: '9',
      category: 'Lending & Borrowing',
      protocol: 'Venus',
      text: 'Deposit 1 BNB on Venus, then borrow 200 USDT on BNB Network.',
      copied: false,
    },
    {
      id: '10',
      category: 'Lending & Borrowing',
      protocol: 'Kamino',
      text: 'Deposit 10 SOL on Kamino, then borrow 1000 USDC on Solana.',
      copied: false,
    },
  ]);

  const copyToClipboard = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setPrompts(
        prompts.map((prompt) =>
          prompt.id === id ? { ...prompt, copied: true } : prompt
        )
      );
      setTimeout(() => {
        setPrompts(
          prompts.map((prompt) =>
            prompt.id === id ? { ...prompt, copied: false } : prompt
          )
        );
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const filteredPrompts = selectedCategory
    ? prompts.filter((prompt) => prompt.category === selectedCategory)
    : prompts;

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20 pointer-events-none" />

      <div className="relative">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.header
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.img
              src="https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg"
              alt="heyAnon logo"
              className="w-16 h-16 rounded-full ring-2 ring-orange-500/50"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-500">
              Save The <span>Prompt</span>
            </h1>
          </div>
          <p className="text-gray-400">Prompts from heyAnon</p>
        </motion.header>

        <motion.div
          className="flex justify-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {['All', 'Staking/LSDs', 'Lending & Borrowing'].map(
            (category, index) => (
              <motion.button
                key={category}
                onClick={() =>
                  setSelectedCategory(category === 'All' ? null : category)
                }
                className={cn(
                  'px-6 py-2 rounded-full transition-all relative overflow-hidden',
                  'before:absolute before:inset-0 before:transition-all before:duration-300',
                  category === (selectedCategory ?? 'All')
                    ? 'text-white before:bg-orange-500'
                    : 'text-gray-300 hover:text-white before:bg-gray-800 hover:before:bg-gray-700'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="relative z-10">{category}</span>
              </motion.button>
            )
          )}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {filteredPrompts.map((prompt, index) => (
            <motion.div
              key={prompt.id}
              className="group bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg transition-all border border-gray-800/50 hover:border-orange-500/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-4">
                <motion.span
                  className="px-3 py-1 bg-gradient-to-r from-orange-500 to-purple-500 text-sm rounded-full"
                  whileHover={{ scale: 1.05 }}
                >
                  {prompt.protocol}
                </motion.span>
                <motion.button
                  onClick={() => copyToClipboard(prompt.id, prompt.text)}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                  title="Copy prompt"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {prompt.copied ? (
                    <CopyCheck className="w-6 h-6 text-green-500" />
                  ) : (
                    <Copy className="w-6 h-6" />
                  )}
                </motion.button>
              </div>
              <p className="text-lg mb-2 group-hover:text-orange-500/90 transition-colors">
                {prompt.text}
              </p>
              <div className="flex items-center mt-4">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm text-gray-500">{prompt.category}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default App;
