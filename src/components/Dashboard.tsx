import { useState, useEffect, Fragment, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Save,
  X,
  Loader2,
  Pencil,
  ChevronDown,
  Home,
  LayoutGrid,
  Table2,
  Heart,
  UserCircle,
  Wrench,
  Shield,
  Filter,
  Copy,
  CopyCheck,
  Ticket,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';
import { cn } from '../utils';
import { Listbox, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { useMaintenance } from '../context/MaintenanceContext';
import { useUser } from '../context/UserContext';
import { useProfile } from '../context/ProfileContext';

type Category = {
  id: string;
  name: string;
};

type Protocol = {
  id: string;
  name: string;
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
  created_at: string;
  copied?: boolean;
};

type Invite = {
  id: string;
  code: string;
  user_id: string | null;
  created_at: string;
  expires_at: string | null;
};

type SortOption = {
  id: 'none' | 'category' | 'protocol' | 'date';
  name: string;
};

const sortOptions: SortOption[] = [
  { id: 'none', name: 'No Sort' },
  { id: 'category', name: 'Sort by Category' },
  { id: 'protocol', name: 'Sort by Protocol' },
  { id: 'date', name: 'Sort by Date' },
];

export function Dashboard() {
  const { user, displayName } = useUser();
  const { maintenanceMode, setMaintenanceMode } = useMaintenance();
  const { profile } = useProfile();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [favorites, setFavorites] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [activeView, setActiveView] = useState<'my-prompts' | 'favorites'>(
    'my-prompts'
  );
  const [showInviteManager, setShowInviteManager] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [newPrompt, setNewPrompt] = useState({
    category_id: '',
    protocol_id: '',
    text: '',
    fromHeyAnon: false,
  });

  const toggleMaintenanceMode = useCallback(() => {
    setMaintenanceMode(!maintenanceMode);
  }, [maintenanceMode, setMaintenanceMode]);

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchProtocols(),
      fetchPrompts(),
      fetchFavorites(),
    ]);
  }, []);

  useEffect(() => {
    sortPrompts();
  }, [selectedSort, activeView]);

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

  const generateInviteCode = async () => {
    try {
      if (!user) return;

      const code =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

      const { error } = await supabase.from('invites').insert([
        {
          code,
          created_by: user.id,
          expires_at: expiresAt.toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success('Invite code generated successfully');
      fetchInvites();
    } catch (error) {
      console.error('Error generating invite code:', error);
      toast.error('Error generating invite code');
    }
  };

  const fetchInvites = async () => {
    try {
      setLoadingInvites(true);
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Error fetching invites');
    } finally {
      setLoadingInvites(false);
    }
  };

  const deleteInvite = async (id: string) => {
    try {
      const { error } = await supabase.from('invites').delete().eq('id', id);

      if (error) throw error;

      toast.success('Invite code deleted successfully');
      setInvites(invites.filter((invite) => invite.id !== id));
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error('Error deleting invite');
    }
  };

  async function fetchCategories() {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(categories || []);

      if (categories && categories.length > 0) {
        setNewPrompt((prev) => ({ ...prev, category_id: categories[0].id }));
      }
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Error:', error);
    }
  }

  async function fetchProtocols() {
    try {
      const { data: protocols, error } = await supabase
        .from('protocols')
        .select('*')
        .order('name');

      if (error) throw error;
      setProtocols(protocols || []);

      if (protocols && protocols.length > 0) {
        setNewPrompt((prev) => ({ ...prev, protocol_id: protocols[0].id }));
      }
    } catch (error) {
      toast.error('Error fetching protocols');
      console.error('Error:', error);
    }
  }

  async function fetchPrompts() {
    try {
      if (!user) {
        toast.error('Please sign in to view your prompts');
        return;
      }

      const { data: userPrompts, error } = await supabase
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
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(userPrompts || []);
    } catch (error) {
      toast.error('Error fetching prompts');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFavorites() {
    try {
      if (!user) return;

      const { data: favoriteIds, error: favError } = await supabase
        .from('favorites')
        .select('prompt_id')
        .eq('user_id', user.id);

      if (favError) throw favError;

      if (favoriteIds && favoriteIds.length > 0) {
        const { data: favoritePrompts, error: promptError } = await supabase
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
            )
          `
          )
          .in(
            'id',
            favoriteIds.map((f) => f.prompt_id)
          );

        if (promptError) throw promptError;
        setFavorites(favoritePrompts || []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      toast.error('Error fetching favorites');
      console.error('Error:', error);
    }
  }

  async function createPrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!newPrompt.protocol_id || !newPrompt.text.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (!user) {
        toast.error('Please sign in to create prompts');
        return;
      }

      const { error } = await supabase.from('prompts').insert([
        {
          category_id: newPrompt.category_id,
          protocol_id: newPrompt.protocol_id,
          text: newPrompt.text,
          user_id: user.id,
          display_name: displayName || 'Anonymous',
          fromHeyAnon: newPrompt.fromHeyAnon,
        },
      ]);

      if (error) throw error;

      toast.success('Prompt created successfully');
      setIsCreating(false);
      setNewPrompt({
        category_id: categories[0]?.id || '',
        protocol_id: protocols[0]?.id || '',
        text: '',
        fromHeyAnon: false,
      });
      fetchPrompts();
    } catch (error) {
      toast.error('Error creating prompt');
      console.error('Error:', error);
    }
  }

  async function updatePrompt(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPrompt) return;

    try {
      if (!user) {
        toast.error('Please sign in to update prompts');
        return;
      }

      const { error } = await supabase
        .from('prompts')
        .update({
          category_id: editingPrompt.category_id,
          protocol_id: editingPrompt.protocol_id,
          text: editingPrompt.text,
          fromHeyAnon: editingPrompt.fromHeyAnon,
        })
        .eq('id', editingPrompt.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Prompt updated successfully');
      setEditingPrompt(null);
      fetchPrompts();
    } catch (error) {
      toast.error('Error updating prompt');
      console.error('Error:', error);
    }
  }

  async function deletePrompt(id: string) {
    try {
      if (!user) {
        toast.error('Please sign in to delete prompts');
        return;
      }

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Prompt deleted successfully');
      setPrompts(prompts.filter((prompt) => prompt.id !== id));
    } catch (error) {
      toast.error('Error deleting prompt');
      console.error('Error:', error);
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
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setPrompts(
          prompts.map((prompt) =>
            prompt.id === id ? { ...prompt, copied: false } : prompt
          )
        );
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy text');
    }
  };

  const CustomDropdown = ({
    value,
    onChange,
    options,
    label,
  }: {
    value: string;
    onChange: (value: string) => void;
    options: { id: string; name: string }[];
    label: string;
  }) => (
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-1">
        <Listbox.Label className="block text-sm font-medium text-gray-300 mb-1">
          {label}
        </Listbox.Label>
        <Listbox.Button className="relative w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500 text-left">
          <span className="block truncate">
            {options.find((opt) => opt.id === value)?.name}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg border border-gray-700 shadow-lg max-h-60 overflow-auto focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.id}
                value={option.id}
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
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Show maintenance mode page for non-admin users when maintenance is active
  if (maintenanceMode && !profile?.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <img
          src="https://u.cubeupload.com/itskkoma/laptop.png"
          alt="Maintenance Mode"
          className="max-w-md w-full rounded-lg mb-6 shadow-xl"
        />
        <h1 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-purple-500">
          Under Maintenance
        </h1>
        <p className="text-gray-400 text-center max-w-md">
          We're making some improvements to our system. We'll be back online
          shortly!
        </p>
      </div>
    );
  }

  const displayedPrompts = activeView === 'my-prompts' ? prompts : favorites;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setActiveView('my-prompts')}
              className={cn(
                'px-4 py-2 rounded-full transition-colors',
                activeView === 'my-prompts'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              My Prompts
            </motion.button>
            <motion.button
              onClick={() => setActiveView('favorites')}
              className={cn(
                'px-4 py-2 rounded-full transition-colors flex items-center gap-2',
                activeView === 'favorites'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart
                className={cn(
                  'w-4 h-4',
                  activeView === 'favorites' && 'fill-current'
                )}
              />
              Favorites
            </motion.button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {profile?.is_admin && (
            <motion.button
              onClick={toggleMaintenanceMode}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full transition-colors',
                maintenanceMode
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Wrench className="w-4 h-4" />
              <span className="hidden sm:inline">
                {maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
              </span>
            </motion.button>
          )}
          <div className="w-48">
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
                            active
                              ? 'bg-orange-500 text-white'
                              : 'text-gray-300'
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
              <LayoutGrid className="w-5 h-5" />
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
              <Table2 className="w-5 h-5" />
            </motion.button>
          </div>
          {activeView === 'my-prompts' && !isCreating && !editingPrompt && (
            <motion.button
              onClick={() => setIsCreating(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Prompt</span>
            </motion.button>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserCircle className="w-10 h-10 text-orange-500" />
            <div>
              <p className="text-sm text-gray-400">Display Name</p>
              <div className="flex items-center gap-2">
                <p className="text-white">{displayName || 'Anonymous'}</p>
                {profile?.is_admin && (
                  <Shield className="w-4 h-4 text-orange-500" title="Admin" />
                )}
              </div>
            </div>
          </div>
          {profile?.is_admin && (
            <motion.button
              onClick={() => {
                setShowInviteManager(true);
                fetchInvites();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Ticket className="w-4 h-4" />
              <span>Manage Invites</span>
            </motion.button>
          )}
        </div>
      </motion.div>

      {showInviteManager && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/50"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manage Invite Codes</h3>
            <button
              onClick={() => setShowInviteManager(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <motion.button
              onClick={generateInviteCode}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-4 h-4" />
              Generate New Invite Code
            </motion.button>

            {loadingInvites ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              </div>
            ) : invites.length === 0 ? (
              <p className="text-center text-gray-400 py-4">
                No invite codes generated yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="py-2 px-4">Code</th>
                      <th className="py-2 px-4">Status</th>
                      <th className="py-2 px-4">Expires</th>
                      <th className="py-2 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invites.map((invite) => (
                      <tr key={invite.id} className="border-b border-gray-800">
                        <td className="py-2 px-4 font-mono">{invite.code}</td>
                        <td className="py-2 px-4">
                          {invite.user_id ? (
                            <span className="text-red-500">Used</span>
                          ) : (
                            <span className="text-green-500">Available</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          {invite.expires_at ? (
                            new Date(invite.expires_at) > new Date() ? (
                              <span className="text-orange-500">
                                {new Date(
                                  invite.expires_at
                                ).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-red-500">Expired</span>
                            )
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => deleteInvite(invite.id)}
                            className="text-red-500 hover:text-red-400"
                            disabled={invite.user_id !== null}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {isCreating && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/50"
          onSubmit={createPrompt}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Prompt</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <CustomDropdown
              value={newPrompt.category_id}
              onChange={(value) =>
                setNewPrompt({ ...newPrompt, category_id: value })
              }
              options={categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
              }))}
              label="Category"
            />

            <CustomDropdown
              value={newPrompt.protocol_id}
              onChange={(value) =>
                setNewPrompt({ ...newPrompt, protocol_id: value })
              }
              options={protocols.map((prot) => ({
                id: prot.id,
                name: prot.name,
              }))}
              label="Protocol"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prompt Text
              </label>
              <textarea
                value={newPrompt.text}
                onChange={(e) =>
                  setNewPrompt({ ...newPrompt, text: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500 min-h-[100px]"
                placeholder="Enter your prompt here..."
              />
            </div>

            {profile?.is_anon_member && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fromHeyAnon"
                  checked={newPrompt.fromHeyAnon}
                  onChange={(e) =>
                    setNewPrompt({
                      ...newPrompt,
                      fromHeyAnon: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="fromHeyAnon" className="text-sm text-gray-300">
                  Post as HeyAnon member
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <motion.button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Save Prompt
              </motion.button>
            </div>
          </div>
        </motion.form>
      )}

      {editingPrompt && (
        <motion.form
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-gray-800/50"
          onSubmit={updatePrompt}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Prompt</h3>
            <button
              type="button"
              onClick={() => setEditingPrompt(null)}
              className="text-gray-400 hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <CustomDropdown
              value={editingPrompt.category_id}
              onChange={(value) =>
                setEditingPrompt({ ...editingPrompt, category_id: value })
              }
              options={categories.map((cat) => ({
                id: cat.id,
                name: cat.name,
              }))}
              label="Category"
            />

            <CustomDropdown
              value={editingPrompt.protocol_id}
              onChange={(value) =>
                setEditingPrompt({ ...editingPrompt, protocol_id: value })
              }
              options={protocols.map((prot) => ({
                id: prot.id,
                name: prot.name,
              }))}
              label="Protocol"
            />

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prompt Text
              </label>
              <textarea
                value={editingPrompt.text}
                onChange={(e) =>
                  setEditingPrompt({ ...editingPrompt, text: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:border-orange-500 min-h-[100px]"
                placeholder="Enter your prompt here..."
              />
            </div>

            {profile?.is_anon_member && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="fromHeyAnon-edit"
                  checked={editingPrompt.fromHeyAnon}
                  onChange={(e) =>
                    setEditingPrompt({
                      ...editingPrompt,
                      fromHeyAnon: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-orange-500 focus:ring-orange-500"
                />
                <label
                  htmlFor="fromHeyAnon-edit"
                  className="text-sm text-gray-300"
                >
                  Post as HeyAnon member
                </label>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <motion.button
                type="button"
                onClick={() => setEditingPrompt(null)}
                className="w-full sm:w-auto px-4 py-2 text-gray-300 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-4 h-4" />
                Update Prompt
              </motion.button>
            </div>
          </div>
        </motion.form>
      )}

      {viewMode === 'cards' ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {displayedPrompts.length === 0 ? (
            <motion.div
              className="col-span-full text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-400">
                {activeView === 'my-prompts'
                  ? "You haven't created any prompts yet."
                  : "You haven't favorited any prompts yet."}
              </p>
              <p className="text-sm mt-2">
                {activeView === 'my-prompts'
                  ? 'Click the "New Prompt" button to get started!'
                  : 'Browse prompts and click the heart icon to add them to your favorites.'}
              </p>
            </motion.div>
          ) : (
            displayedPrompts.map((prompt, index) => (
              <motion.div
                key={prompt.id}
                className={cn(
                  'group transition-all h-full',
                  'backdrop-blur-sm rounded-lg p-4 sm:p-6',
                  prompt.fromHeyAnon
                    ? 'bg-slate-900/50 border-2 border-orange-500 bg-gradient-to-r from-orange-500/20 to-transparent hover:from-orange-500/30 hover:to-orange-500/10'
                    : 'bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50'
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
                      <UserCircle className="w-3 h-3" />
                      Created by{' '}
                      {prompt.fromHeyAnon ? (
                        <span className="text-orange-500 font-medium">
                          HeyAnon
                        </span>
                      ) : (
                        <span className="text-purple-500 font-medium">
                          {prompt.display_name}
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
                    {activeView === 'my-prompts' && (
                      <>
                        <motion.button
                          onClick={() => setEditingPrompt(prompt)}
                          className="text-gray-400 hover:text-orange-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Pencil className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                        <motion.button
                          onClick={() => deletePrompt(prompt.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                        </motion.button>
                      </>
                    )}
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
              {displayedPrompts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    {activeView === 'my-prompts'
                      ? "You haven't created any prompts yet."
                      : "You haven't favorited any prompts yet."}
                  </td>
                </tr>
              ) : (
                displayedPrompts.map((prompt, index) => (
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
                      <UserCircle className="w-3 h-3" />
                      Created by{' '}
                      {prompt.fromHeyAnon ? (
                        <span className="text-orange-500 font-medium">
                          HeyAnon
                        </span>
                      ) : (
                        <span className="text-purple-500 font-medium">
                          {prompt.display_name}
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
                        {activeView === 'my-prompts' && (
                          <>
                            <motion.button
                              onClick={() => setEditingPrompt(prompt)}
                              className="text-gray-400 hover:text-orange-500 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Pencil className="w-5 h-5" />
                            </motion.button>
                            <motion.button
                              onClick={() => deletePrompt(prompt.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
