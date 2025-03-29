import React, { useState, useEffect } from 'react';
import {
  Copy,
  CopyCheck,
  Filter,
  Heart,
  Table2,
  LayoutGrid,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import { cn } from './utils';

type Prompt = {
  id: string;
  category:
    | 'Staking/LSDs'
    | 'Lend & Borrow'
    | 'Trading'
    | 'Swaps'
    | 'Liquidity Pool'
    | 'Cross Chain';
  protocol: string;
  text: string;
  copied: boolean;
};

function App() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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
      category: 'Swaps',
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
      category: 'Lend & Borrow',
      protocol: 'Aave',
      text: 'Supply 10 WETH to Aave on Arbitrum, then borrow 2000 USDC.',
      copied: false,
    },
    {
      id: '8',
      category: 'Lend & Borrow',
      protocol: 'Spark',
      text: 'Deposit 1 WETH to Spark on Ethereum, then borrow 10% of the deposit in DAI.',
      copied: false,
    },
    {
      id: '9',
      category: 'Lend & Borrow',
      protocol: 'Venus',
      text: 'Deposit 1 BNB on Venus, then borrow 200 USDT on BNB Network.',
      copied: false,
    },
    {
      id: '10',
      category: 'Lend & Borrow',
      protocol: 'Kamino',
      text: 'Deposit 10 SOL on Kamino, then borrow 1000 USDC on Solana.',
      copied: false,
    },
    {
      id: '11',
      category: 'Trading',
      protocol: 'PancakeSwap',
      text: 'Swap 80% of my BNB to CAKE on BNB Chain and set a trailing stop loss at 20% of the current price of Cake',
      copied: false,
    },
    {
      id: '12',
      category: 'Swaps',
      protocol: 'Sanctum',
      text: 'HeyAnon, using Sanctum, please split 60% of my SOL across JupSOL, mSOL, and LST',
      copied: false,
    },
    {
      id: '13',
      category: 'Swaps',
      protocol: 'Solana',
      text: 'Hey Anon, please consolidate all balances below $50 into USDC on Solana.',
      copied: false,
    },
    {
      id: '14',
      category: 'Trading',
      protocol: 'Balancer',
      text: 'Hey Anon, please take profit and close 30% of my ETH position at $2150 for USDC. Create an LP with the USDC profits for ETHUSDC on Balancer.',
      copied: false,
    },
    {
      id: '16',
      category: 'Liquidity Pool',
      protocol: 'Meteora',
      text: 'Hey Anon, create an LP on Meteora with $5 of USDC and $5 of Solana.',
      copied: false,
    },
    {
      id: '17',
      category: 'Liquidity Pool',
      protocol: 'Meteora',
      text: 'Claim my rewards on Meteora and swap them all into Solana.',
      copied: false,
    },
    {
      id: '18',
      category: 'Trading',
      protocol: 'All',
      text: 'Sell all my ETH when ETH reaches an all time high.',
      copied: false,
    },
    {
      id: '19',
      category: 'Trading',
      protocol: 'All',
      text: 'Buy 1000 USDT worth of Link on Ethereum when the price of Link reaches an all time low!',
      copied: false,
    },
    {
      id: '20',
      category: 'Cross Chain',
      protocol: 'LayerZero',
      text: 'Bridge 1000 USDC from ETH to Base',
      copied: false,
    },
    {
      id: '21',
      category: 'Cross Chain',
      protocol: 'deBridge',
      text: 'Swap 500 USDC on Arbitrum to USDC on Solana using deBridge',
      copied: false,
    },
    {
      id: '22',
      category: 'Cross Chain',
      protocol: 'Magpie',
      text: 'Swap 100 S on Sonic to UDST on Arbitrum using Magpie',
      copied: false,
    },
  ]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const copyToClipboard = async (
    e: React.MouseEvent,
    id: string,
    text: string
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setPrompts(
        prompts.map((prompt) =>
          prompt.id === id ? { ...prompt, copied: true } : prompt
        )
      );
      toast.success('Prompt copied to clipboard!', {
        position: 'bottom-center',
        duration: 2000,
      });
      setTimeout(() => {
        setPrompts(
          prompts.map((prompt) =>
            prompt.id === id ? { ...prompt, copied: false } : prompt
          )
        );
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy prompt', {
        position: 'bottom-center',
      });
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
      toast.success('Removed from favorites', {
        position: 'bottom-center',
        duration: 2000,
      });
    } else {
      setFavorites([...favorites, id]);
      toast.success('Added to favorites', {
        position: 'bottom-center',
        duration: 2000,
      });
    }
  };

  const filteredPrompts =
    selectedCategory === 'Favorites'
      ? prompts.filter((prompt) => favorites.includes(prompt.id))
      : selectedCategory
      ? prompts.filter((prompt) => prompt.category === selectedCategory)
      : prompts;

  // Debugging log to verify the number of prompts
  console.log('Filtered Prompts Length:', filteredPrompts.length);
  console.log('Selected Category:', selectedCategory);

  const categories = [
    'All',
    'Favorites',
    'Staking/LSDs',
    'Lend & Borrow',
    'Trading',
    'Swaps',
    'Liquidity Pool',
    'Cross Chain',
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Toaster theme="dark" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-purple-500/20 pointer-events-none" />
      <div className="relative">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-orange-500 to-purple-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <motion.header
          className="mb-8 sm:mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <motion.img
              src="https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg"
              alt="heyAnon logo"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 ring-orange-500/50"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300, damping: 10 }}
            />
            <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-500">
              Save The <span>Prompt</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Prompts from heyAnon
          </p>
        </motion.header>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-6 sm:mb-8 max-w-[600px] lg:max-w-none mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              onClick={() =>
                setSelectedCategory(category === 'All' ? null : category)
              }
              className={cn(
                'px-3 sm:px-6 py-1.5 sm:py-2 rounded-full transition-all relative overflow-hidden text-sm sm:text-base w-full',
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
              <span className="relative z-10 whitespace-nowrap">
                {category}
              </span>
            </motion.button>
          ))}
        </motion.div>

        <div className="flex justify-end mb-4">
          <motion.button
            onClick={() => setViewMode('cards')}
            className={cn(
              'p-2 rounded-l-full bg-gray-800 hover:bg-gray-700',
              viewMode === 'cards' && 'bg-orange-500 hover:bg-orange-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LayoutGrid className="w-6 h-6" />
          </motion.button>
          <motion.button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-2 rounded-r-full bg-gray-800 hover:bg-gray-700',
              viewMode === 'table' && 'bg-orange-500 hover:bg-orange-600'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Table2 className="w-6 h-6" />
          </motion.button>
        </div>

        {viewMode === 'cards' ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                className="group bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all border border-gray-800/50 hover:border-orange-500/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <motion.span
                    className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-purple-500 text-xs sm:text-sm rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    {prompt.protocol}
                  </motion.span>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) =>
                        copyToClipboard(e, prompt.id, prompt.text)
                      }
                      className="text-gray-400 hover:text-orange-500 transition-colors p-1"
                      title="Copy prompt"
                    >
                      {prompt.copied ? (
                        <CopyCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                      ) : (
                        <Copy className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleFavorite(prompt.id)}
                      className={cn(
                        'transition-colors p-1',
                        favorites.includes(prompt.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                      )}
                      title={
                        favorites.includes(prompt.id)
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                    >
                      {favorites.includes(prompt.id) ? (
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
                      ) : (
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-base sm:text-lg mb-2 group-hover:text-orange-500/90 transition-colors">
                  {prompt.text}
                </p>
                <div className="flex items-center mt-3 sm:mt-4">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-2" />
                  <span className="text-xs sm:text-sm text-gray-500">
                    {prompt.category}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <table className="w-full text-left border-collapse bg-gray-900/50 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="p-3 text-sm font-semibold">Protocol</th>
                  <th className="p-3 text-sm font-semibold">Prompt</th>
                  <th className="p-3 text-sm font-semibold">Category</th>
                  <th className="p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrompts.map((prompt, index) => (
                  <motion.tr
                    key={prompt.id}
                    className="border-t border-gray-800/50 hover:bg-gray-800/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-3">{prompt.protocol}</td>
                    <td className="p-3">{prompt.text}</td>
                    <td className="p-3">{prompt.category}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={(e) =>
                          copyToClipboard(e, prompt.id, prompt.text)
                        }
                        className="text-gray-400 hover:text-orange-500 transition-colors"
                        title="Copy prompt"
                      >
                        {prompt.copied ? (
                          <CopyCheck className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleFavorite(prompt.id)}
                        className={cn(
                          'transition-colors',
                          favorites.includes(prompt.id)
                            ? 'text-red-500 hover:text-red-600'
                            : 'text-gray-400 hover:text-red-500'
                        )}
                        title={
                          favorites.includes(prompt.id)
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                      >
                        {favorites.includes(prompt.id) ? (
                          <Heart className="w-5 h-5 fill-current" />
                        ) : (
                          <Heart className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default App;
