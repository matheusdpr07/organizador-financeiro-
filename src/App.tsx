import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, TrendingUp, Trash2, Calendar, Plus, ChevronLeft, ChevronRight, Crown, Trophy, AlertCircle, XCircle, Eye, EyeOff, Camera, X, Pencil, Sparkles, Moon, Sun, LayoutDashboard, History, LogOut
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from './supabase';
import type { Transaction, TransactionType } from './types';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || 'Usuário' } }
        });
        if (error) throw error;
        setError('Verifique seu e-mail para confirmar o cadastro!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-[#0f1115]">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img alt="Organizer Logo" src="/logo financeiro sem texto.png" className="w-full h-full object-cover" />
        </div>
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white uppercase">
          {isRegistering ? 'Criar sua conta' : 'Entrar na sua conta'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-100">Nome</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-brand-500" placeholder="Seu nome" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-100">E-mail</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-brand-500" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-100">Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 outline-white/10 focus:outline-2 focus:outline-brand-500" placeholder="••••••••" />
          </div>

          {error && <p className={`text-xs font-bold text-center ${error.includes('confirmar') ? 'text-emerald-500' : 'text-rose-500'}`}>{error}</p>}

          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-md bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'Processando...' : isRegistering ? 'Criar conta' : 'Acessar Plataforma'}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-gray-400">
          {isRegistering ? 'Já tem uma conta?' : 'Ainda não é membro?'}{' '}
          <button onClick={() => setIsRegistering(!isRegistering)} className="font-semibold text-brand-400 hover:text-brand-300">
            {isRegistering ? 'Faça login agora' : 'Comece a organizar agora'}
          </button>
        </p>
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('organizer_theme') === 'dark');
  const [activeTab, setActiveTab] = useState<'summary' | 'form' | 'history'>('summary');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchTransactions();
  }, [session]);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) console.error(error);
    else setTransactions(data || []);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('organizer_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => supabase.auth.signOut();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth));
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      const val = Number(t.amount);
      if (t.type === 'income') acc.income += val;
      else acc.expense += val;
      acc.total = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, total: 0 });
  }, [filteredTransactions]);

  const financialStatus = useMemo(() => {
    const { income, total } = summary;
    if (total < 0) return { label: 'Crítico', color: 'text-rose-600', bgColor: 'bg-rose-50', icon: <XCircle className="w-4 h-4" /> };
    if (income === 0) return { label: 'Iniciante', color: 'text-neutral-500', bgColor: 'bg-neutral-50', icon: <Sparkles className="w-4 h-4" /> };
    const ratio = total / income;
    if (ratio >= 0.5) return { label: 'Rei', color: 'text-brand-600', bgColor: 'bg-brand-50', icon: <Crown className="w-4 h-4" /> };
    if (ratio >= 0.3) return { label: 'Ótimo', color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: <Trophy className="w-4 h-4" /> };
    return { label: 'Mediano', color: 'text-amber-600', bgColor: 'bg-amber-50', icon: <AlertCircle className="w-4 h-4" /> };
  }, [summary]);

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !session) return;
    const numericAmount = Math.abs(Number(amount));

    if (editingId) {
      const { error } = await supabase.from('transactions').update({ description, amount: numericAmount, date, type }).eq('id', editingId);
      if (!error) {
        setTransactions(transactions.map(t => t.id === editingId ? { ...t, description, amount: numericAmount, type, date } : t));
        setEditingId(null);
      }
    } else {
      const { data, error } = await supabase.from('transactions').insert([{ 
        description, amount: numericAmount, type, date, user_id: session.user.id 
      }]).select();
      if (!error && data) setTransactions([data[0], ...transactions]);
    }
    setDescription(''); setAmount(''); setDate(format(new Date(), 'yyyy-MM-dd'));
    if (window.innerWidth < 1024) setActiveTab('history');
  };

  const startEdit = (t: Transaction) => {
    setEditingId(t.id); setDescription(t.description); setAmount(t.amount.toString()); setType(t.type); setDate(t.date);
    if (window.innerWidth < 1024) setActiveTab('form');
  };

  const removeTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(transactions.filter(t => t.id !== id));
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  if (!session) return <Login />;

  const userMetadata = session.user.user_metadata;

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'} font-sans antialiased overflow-x-hidden`}>
      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ${isDarkMode ? 'bg-[#0f1115]' : 'bg-white'} ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center text-center w-full max-w-2xl px-6">
            <div className="relative mb-8 animate-scale-in">
              <div className={`w-48 h-48 overflow-hidden rounded-[40px] shadow-2xl border ${isDarkMode ? 'border-slate-800 bg-[#161a20]' : 'border-slate-50 bg-white'}`}>
                <img src="/logo financeiro sem texto.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className={`text-4xl md:text-7xl font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-brand-600'}`}>ORGANIZER</h2>
          </div>
        </div>
      )}

      <div className={`transition-all duration-1000 ${isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <header className={`border-b ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} pt-4 pb-4 px-4 md:px-6 sticky top-0 z-40 backdrop-blur-md`}>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <img src="/logo financeiro sem texto.png" className="w-12 h-12 rounded-2xl" alt="Logo" />
              <h2 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-brand-600'}`}>ORGANIZER</h2>
              <div className="flex items-center bg-brand-600 rounded-lg p-1 ml-auto lg:ml-4">
                <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))} className="p-1 text-white"><ChevronLeft className="w-4 h-4" /></button>
                <span className="mx-4 font-bold text-xs text-white capitalize min-w-[100px] text-center">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                <button onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))} className="p-1 text-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2 pr-4 border-r border-slate-800/10 dark:border-slate-800">
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-slate-800/10 dark:bg-slate-800 text-brand-600 dark:text-amber-400">
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={() => setShowBalance(!showBalance)} className="p-2 text-slate-400">{showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                <button onClick={handleLogout} className="p-2 text-rose-500"><LogOut className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Gestor,</p>
                  <p className="text-sm font-bold">{userMetadata.name || 'Usuário'}</p>
                </div>
                <div onClick={() => setIsEditingProfile(true)} className="w-10 h-10 rounded-xl bg-brand-600/10 border-2 border-brand-600/20 flex items-center justify-center cursor-pointer overflow-hidden">
                  <span className="text-xs font-bold text-brand-600">{getInitials(userMetadata.name || 'Usuário')}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8 pb-32 lg:pb-8">
          {/* TABS MOBILE */}
          <div className="lg:hidden flex bg-white dark:bg-[#161a20] rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button onClick={() => setActiveTab('summary')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'summary' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <LayoutDashboard className="w-4 h-4" /> Resumo
            </button>
            <button onClick={() => setActiveTab('form')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'form' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <PlusCircle className="w-4 h-4" /> Lançar
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>
              <History className="w-4 h-4" /> Extrato
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`lg:col-span-4 space-y-6 ${activeTab === 'summary' || activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
              
              {/* CARD SALDO */}
              <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden ${activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Patrimônio Líquido</p>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold">{showBalance ? `R$ ${summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}</h2>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${financialStatus.bgColor} ${financialStatus.color}`}>
                    {financialStatus.icon} {financialStatus.label}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/10 dark:border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Receitas</p>
                    <p className="text-emerald-500 font-bold">{showBalance ? `+ ${summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '•••'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Despesas</p>
                    <p className="text-rose-500 font-bold">{showBalance ? `- ${summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '•••'}</p>
                  </div>
                </div>
              </div>

              {/* FORMULÁRIO */}
              <div className={`p-8 rounded-2xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-600/10 text-brand-600 flex items-center justify-center">
                    {editingId ? <Pencil className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                  </div>
                  <h3 className="font-bold">{editingId ? 'Editar registro' : 'Nova transação'}</h3>
                </div>
                <form onSubmit={handleSaveTransaction} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Descrição</label>
                    <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Salário" className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none focus:border-brand-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Valor</label>
                      <input type="number" required step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none font-bold" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block ml-1">Data</label>
                      <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700" />
                    </div>
                  </div>
                  <div className="flex gap-2 p-1 bg-black/5 dark:bg-slate-900 rounded-xl">
                    <button type="button" onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'income' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>RECEITA</button>
                    <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'expense' ? 'bg-white dark:bg-rose-500 text-rose-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>DESPESA</button>
                  </div>
                  <button type="submit" className="w-full py-4 rounded-xl bg-brand-600 text-white font-bold uppercase text-xs tracking-widest hover:brightness-110 transition-all shadow-lg shadow-brand-600/20">
                    {editingId ? 'Salvar Edição' : 'Confirmar Lançamento'}
                  </button>
                  {editingId && <button type="button" onClick={() => { setEditingId(null); setDescription(''); setAmount(''); }} className="w-full py-2 text-slate-400 text-[10px] uppercase font-bold">Cancelar</button>}
                </form>
              </div>
            </div>

            {/* LISTAGEM */}
            <div className={`lg:col-span-8 ${activeTab === 'history' ? 'block' : 'hidden lg:block'}`}>
              <div className={`rounded-2xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} overflow-hidden min-h-[500px]`}>
                <div className="p-6 border-b border-slate-800/10 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-inherit z-10 backdrop-blur-md">
                  <h3 className="text-sm font-black uppercase tracking-widest">Extrato Mensal</h3>
                  <span className="text-[10px] font-bold bg-brand-600/10 text-brand-600 px-3 py-1 rounded-full border border-brand-600/20">{filteredTransactions.length} registros</span>
                </div>
                <div className="divide-y divide-slate-800/10 dark:divide-slate-800">
                  {filteredTransactions.map((t) => (
                    <div key={t.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          <TrendingUp className={`w-6 h-6 ${t.type === 'expense' ? 'rotate-180' : ''}`} />
                        </div>
                        <div>
                          <p className="font-bold text-base uppercase tracking-tight">{t.description}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                        <p className={`font-black text-xl ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(t)} className="p-2 text-slate-400 hover:text-brand-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => removeTransaction(t.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <div className="py-32 text-center text-slate-500 opacity-50 flex flex-col items-center gap-4">
                      <Calendar className="w-12 h-12" />
                      <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade neste mês</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* BARRA DE NAVEGAÇÃO INFERIOR MOBILE */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#161a20] border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-around pb-safe">
          <button onClick={() => setActiveTab('summary')} className={`flex flex-col items-center gap-1 ${activeTab === 'summary' ? 'text-brand-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Início</span>
          </button>
          <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1 ${activeTab === 'form' ? 'text-brand-600' : 'text-slate-400'}`}>
            <div className="p-3 rounded-full bg-brand-600 text-white -mt-8 shadow-xl border-4 border-[#f4f5f7] dark:border-[#0f1115]">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase">Lançar</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-brand-600' : 'text-slate-400'}`}>
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase">Extrato</span>
          </button>
        </div>
      </div>

      {/* MODAL CONFIGURAÇÃO */}
      {isEditingProfile && (
        <div className="fixed inset-0 backdrop-blur-md z-[110] flex items-center justify-center p-6 bg-slate-900/60">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-[#161a20]' : 'bg-white'}`}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black uppercase tracking-widest">Configuração</h2>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-8 space-y-6 text-center">
              <div className="relative w-24 h-24 mx-auto group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-full h-full rounded-2xl bg-brand-600/10 border-2 border-brand-600/20 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl font-bold text-brand-600">{getInitials(userMetadata.name || 'Usuário')}</span>
                </div>
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera className="text-white w-6 h-6" />
                </div>
                <input type="file" ref={fileInputRef} className="hidden" />
              </div>
              <p className="text-sm font-bold opacity-50">Configurações de perfil em desenvolvimento</p>
              <button onClick={() => setIsEditingProfile(false)} className="w-full bg-brand-600 text-white font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all text-xs uppercase tracking-widest">Salvar e Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
