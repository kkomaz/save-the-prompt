import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import {
  Copy,
  CopyCheck,
  Filter,
  Heart,
  Table2,
  LayoutGrid,
  ChevronDown,
  Loader2,
  Search,
  UserCircle,
  Shield,
  Users,
} from 'lucide-react';
import { Listbox, Transition } from '@headlessui/react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { cn } from '../utils';

type Category = {
  id: string;
  name: string;
};

type Protocol = {
  id: string;
  name: string;
};

type Profile = {
  is_anon_member: boolean;
};

type Prompt = {
  id: string;
  category_id: string;
  protocol_id: string;
  text: string;
  user_id: string;
  display_name: string;
  fromHeyAnon: boolean;
  categories: Category;
  protocols: Protocol;
  profile: Profile;
  created_at: string;
  copied: boolean;
};

type SortOption = {
  id: 'none' | 'category' | 'protocol' | 'date';
  name: string;
};

type PromptType = 'all' | 'official' | 'community';

const sortOptions: SortOption[] = [
  { id: 'none', name: 'No Sort' },
  { id: 'category', name: 'Sort by Category' },
  { id: 'protocol', name: 'Sort by Protocol' },
  { id: 'date', name: 'Sort by Date' },
];

const promptTypeOptions = [
  { id: 'official', name: 'Official', icon: Shield },
  { id: 'all', name: 'All Prompts', icon: Filter },
  { id: 'community', name: 'Community', icon: Users },
] as const;

export function PromptList() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [promptType, setPromptType] = useState<PromptType>('official');

  useEffect(() => {
    // Get initial user state
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchPrompts(), loadFavorites()]);
  }, [user]);

  useEffect(() => {
    sortPrompts();
  }, [selectedSort]);

  const sortPrompts = () => {
    const sortedPrompts = [...prompts];

    switch (selectedSort.id) {
      case 'category':
        setPrompts(
          sortedPrompts.sort((a, b) =>
            a.categories.name.localeCompare(b.categories.name)
          )
        );
        break;
      case 'protocol':
        setPrompts(
          sortedPrompts.sort((a, b) =>
            a.protocols.name.localeCompare(b.protocols.name)
          )
        );
        break;
      case 'date':
        setPrompts(
          sortedPrompts.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
        break;
      default:
        setPrompts(
          sortedPrompts.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
    }
  };

  const loadFavorites = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('prompt_id')
          .eq('user_id', user.id);

        if (error) throw error;
        setFavorites(data.map((fav) => fav.prompt_id));
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Error loading favorites');
      }
    } else {
      const saved = localStorage.getItem('favorites');
      setFavorites(saved ? JSON.parse(saved) : []);
    }
  };

  useEffect(() => {
    if (!user) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  async function fetchCategories() {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(categories || []);
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Error:', error);
    }
  }

  async function fetchPrompts() {
    try {
      const { data: prompts, error } = await supabase
        .from('prompts')
        .select(
          `
          *,
          categories (
            id,
            name
          ),
          protocols (
            id,
            name
          ),
          profile:user_id (
            is_anon_member
          )
        `
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(
        (prompts || []).map((prompt) => ({ ...prompt, copied: false }))
      );
    } catch (error) {
      toast.error('Error fetching prompts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const toggleFavorite = async (id: string) => {
    if (user) {
      try {
        if (favorites.includes(id)) {
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('prompt_id', id)
            .eq('user_id', user.id);

          if (error) throw error;
          setFavorites(favorites.filter((favId) => favId !== id));
        } else {
          const { error } = await supabase
            .from('favorites')
            .insert([{ prompt_id: id, user_id: user.id }]);

          if (error) throw error;
          setFavorites([...favorites, id]);
        }
      } catch (error) {
        console.error('Error updating favorites:', error);
        toast.error('Error updating favorites');
        return;
      }
    } else {
      if (favorites.includes(id)) {
        setFavorites(favorites.filter((favId) => favId !== id));
      } else {
        setFavorites([...favorites, id]);
      }
    }

    toast.success(
      favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites',
      { position: 'bottom-center', duration: 2000 }
    );
  };

  const filteredPrompts = (() => {
    let result = prompts;

    // Filter by prompt type
    if (promptType === 'official') {
      result = result.filter((prompt) => prompt.fromHeyAnon);
    } else if (promptType === 'community') {
      result = result.filter((prompt) => !prompt.fromHeyAnon);
    }

    // Filter by category if selected
    if (selectedCategory === 'Favorites') {
      result = result.filter((prompt) => favorites.includes(prompt.id));
    } else if (selectedCategory) {
      result = result.filter(
        (prompt) => prompt.categories.name === selectedCategory
      );
    }

    // Filter by search term if present
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (prompt) =>
          prompt.text.toLowerCase().includes(term) ||
          prompt.categories.name.toLowerCase().includes(term) ||
          prompt.protocols.name.toLowerCase().includes(term) ||
          prompt.display_name.toLowerCase().includes(term)
      );
    }

    return result;
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  const selectedPromptType = promptTypeOptions.find(
    (type) => type.id === promptType
  );
  const SelectedIcon = selectedPromptType?.icon;

  return (
    <>
      <motion.div
        className="flex flex-col gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Prompt Type Selection - Dropdown for Mobile, Tabs for Desktop */}
        <div className="relative z-20">
          <Listbox value={promptType} onChange={setPromptType}>
            <div className="sm:hidden">
              <Listbox.Button className="relative w-full px-4 py-2.5 bg-gray-800 text-left rounded-xl border-2 border-orange-500/50 focus:outline-none focus:border-orange-500">
                <span className="flex items-center gap-2">
                  {SelectedIcon && <SelectedIcon className="w-4 h-4" />}
                  <span className="block truncate font-medium">
                    {selectedPromptType?.name}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 rounded-xl border-2 border-orange-500/30 shadow-lg overflow-hidden focus:outline-none">
                  {promptTypeOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        cn(
                          'relative cursor-pointer select-none py-2.5 px-4',
                          active ? 'bg-orange-500 text-white' : 'text-gray-300'
                        )
                      }
                    >
                      {({ selected }) => (
                        <span className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          <span
                            className={cn(
                              'block truncate',
                              selected && 'font-medium'
                            )}
                          >
                            {option.name}
                          </span>
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex gap-2 mb-4">
            {promptTypeOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setPromptType(option.id)}
                className={cn(
                  'px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all',
                  'border-2',
                  promptType === option.id
                    ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:border-orange-500/50'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <option.icon className="w-4 h-4" />
                <span className="font-medium">{option.name}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="relative z-10">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {['All', 'Favorites', ...categories.map((c) => c.name)].map(
              (category, index) => (
                <motion.button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category === 'All' ? null : category)
                  }
                  className={cn(
                    'px-4 py-2 rounded-lg transition-all relative overflow-hidden text-sm',
                    'border hover:border-gray-700',
                    category === (selectedCategory ?? 'All')
                      ? 'bg-gray-800 border-gray-700 text-white font-medium'
                      : 'bg-gray-900/50 border-gray-800/50 text-gray-400 hover:text-white'
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <span className="relative z-10">{category}</span>
                </motion.button>
              )
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-4 sm:gap-0">
        <div className="w-full sm:w-48">
          <Listbox value={selectedSort} onChange={setSelectedSort}>
            <div className="relative">
              <Listbox.Button className="relative w-full px-4 py-2 bg-gray-800 rounded-full border border-gray-700 focus:outline-none focus:border-orange-500 text-left">
                <span className="block truncate">{selectedSort.name}</span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg max-h-60 overflow-auto focus:outline-none">
                  {sortOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option}
                      className={({ active }) =>
                        cn(
                          'relative cursor-pointer select-none py-2 px-4',
                          active ? 'bg-orange-500 text-white' : 'text-gray-300'
                        )
                      }
                    >
                      {({ selected }) => (
                        <span
                          className={cn(
                            'block truncate',
                            selected && 'font-semibold'
                          )}
                        >
                          {option.name}
                        </span>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <div className="flex">
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
      </div>

      {viewMode === 'cards' ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {filteredPrompts.length === 0 ? (
            <motion.div
              className="col-span-full text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-400">
                {searchTerm
                  ? 'No prompts found matching your search criteria.'
                  : selectedCategory === 'Favorites'
                  ? "You haven't favorited any prompts yet."
                  : 'No prompts available in this category.'}
              </p>
            </motion.div>
          ) : (
            filteredPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                className={cn(
                  'group transition-all h-full',
                  'backdrop-blur-sm rounded-lg p-4 sm:p-6',
                  prompt.fromHeyAnon
                    ? 'bg-slate-900/50 border-2 border-orange-500 bg-gradient-to-r from-orange-500/20 to-transparent hover:from-orange-500/30 hover:to-orange-500/10'
                    : 'bg-gray-900/50 border-2 border-yellow-500/50 hover:border-yellow-400/50'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  transition: {
                    duration: 0.3,
                    ease: 'easeOut',
                  },
                }}
              >
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex px-2.5 py-1 bg-gradient-to-r from-orange-500 to-purple-500 text-xs sm:text-sm rounded-full w-fit">
                      {prompt.protocols.name}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      {prompt.fromHeyAnon || prompt.profile?.is_anon_member ? (
                        <img
                          src="https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg"
                          alt="HeyAnon"
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-3 h-3" />
                      )}
                      Created by{' '}
                      {prompt.fromHeyAnon ? (
                        <span className="text-orange-500 font-medium">
                          HeyAnon
                        </span>
                      ) : (
                        <span className="text-purple-500 font-medium">
                          {prompt.display_name}
                          {prompt.profile?.is_anon_member && (
                            <span className="text-orange-400">
                              {' '}
                              (admin/team)
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </div>
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
                    {prompt.categories.name}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-gray-900/50 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="p-3 text-sm font-semibold">Protocol</th>
                <th className="p-3 text-sm font-semibold">Creator</th>
                <th className="p-3 text-sm font-semibold">Prompt</th>
                <th className="p-3 text-sm font-semibold">Category</th>
                <th className="p-3 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrompts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    {searchTerm
                      ? 'No prompts found matching your search criteria.'
                      : selectedCategory === 'Favorites'
                      ? "You haven't favorited any prompts yet."
                      : 'No prompts available in this category.'}
                  </td>
                </tr>
              ) : (
                filteredPrompts.map((prompt, index) => (
                  <motion.tr
                    key={prompt.id}
                    className={cn(
                      'border-t hover:bg-gray-800/30',
                      prompt.fromHeyAnon
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-gray-800/50'
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="p-3">
                      <span className="inline-flex px-2.5 py-1 bg-gradient-to-r from-orange-500 to-purple-500 text-xs rounded-full w-fit">
                        {prompt.protocols.name}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 flex items-center gap-1">
                      {prompt.fromHeyAnon || prompt.profile?.is_anon_member ? (
                        <img
                          src="https://pbs.twimg.com/profile_images/1894035469614104576/Gk3WK_Mm_400x400.jpg"
                          alt="HeyAnon"
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <UserCircle className="w-3 h-3" />
                      )}
                      Created by{' '}
                      {prompt.fromHeyAnon ? (
                        <span className="text-orange-500 font-medium">
                          HeyAnon
                        </span>
                      ) : (
                        <span className="text-purple-500 font-medium">
                          {prompt.display_name}
                          {prompt.profile?.is_anon_member && (
                            <span className="text-orange-400">
                              {' '}
                              (admin/team)
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="p-3">{prompt.text}</td>
                    <td className="p-3">{prompt.categories.name}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
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
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
