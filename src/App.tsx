import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, Trash2, ChevronLeft, ChevronRight, Crown, Trophy, AlertCircle, XCircle, Eye, EyeOff, Camera, X, Pencil, Sparkles, Moon, Sun, LayoutDashboard, History, LogOut, PlusCircle, Plus, Check, User
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from './supabase';
import GradientText from './GradientText';
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
          options: { data: { name: name || 'Usuário', avatar_url: '' } }
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
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden bg-[#050212]">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#1a0b2e_0%,#050212_100%)]"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#7a0ae5]/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#bc00ff]/5 blur-[120px] rounded-full"></div>

      <div className="relative z-10 w-full max-w-[360px] bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl">
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-8 group">
            <div className="absolute inset-0 bg-[#7a0ae5]/30 blur-[30px] rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-[38px] overflow-hidden border border-white/20 bg-black flex items-center justify-center">
              <img alt="Logo" src="/logo financeiro sem texto.png" className="w-full h-full object-cover" />
            </div>
          </div>
          
          <GradientText
            colors={["#7a0ae5", "#ffffff", "#7a0ae5"]}
            animationSpeed={4}
            yoyo={false}
            className="text-3xl font-black uppercase tracking-[0.2em]"
          >
            ORGANIZER
          </GradientText>
          <p className="mt-2 text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase text-center">Inteligência Financeira</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">Nome do Gestor</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="Seu nome" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">E-mail de Acesso</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="seu@email.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">Senha Particular</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="••••••••" />
          </div>

          {error && <p className={`text-[10px] font-bold text-center p-3 rounded-xl ${error.includes('confirmar') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#7a0ae5] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#7a0ae5]/30 active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 mt-2">
            {loading ? 'Sincronizando...' : isRegistering ? 'Criar Conta' : 'Acessar Painel'}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
          {isRegistering ? 'Já tem acesso?' : 'Ainda sem conta?'}<br/>
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#7a0ae5] hover:text-white transition-colors underline decoration-2 underline-offset-4 font-black">
            {isRegistering ? 'Fazer login agora' : 'Começar gratuitamente'}
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
  const [uploading, setUploading] = useState(false);
  const [tempName, setTempName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.name) setTempName(session.user.user_metadata.name);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.user_metadata?.name) setTempName(session.user.user_metadata.name || '');
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const fetchTransactions = async () => {
        const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
        if (error) console.error(error);
        else setTransactions(data || []);
      };
      fetchTransactions();
    }
  }, [session]);

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

  const changeMonth = (offset: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
  };

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
  };

  const removeTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (!error) setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: { name: tempName }
      });
      if (error) throw error;
      
      if (data?.user) {
        setSession((prev: any) => ({ ...prev, user: data.user }));
      }
      
      setIsEditingProfile(false);
    } catch (error: any) {
      alert('Erro ao atualizar perfil: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !session) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type 
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      
      const { data, error: updateError } = await supabase.auth.updateUser({ 
        data: { avatar_url: publicUrl } 
      });

      if (updateError) throw updateError;
      
      if (data?.user) {
        setSession((prev: any) => ({ ...prev, user: data.user }));
      }

    } catch (error: any) {
      alert('Erro no upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  if (!session) return <Login />;

  const userMetadata = session.user.user_metadata;
  const userName = userMetadata?.name || session.user.email?.split('@')[0] || 'Usuário';
  const userAvatar = userMetadata?.avatar_url;

  return (
    <div className={`relative flex flex-col h-[100dvh] transition-colors duration-500 ${isDarkMode ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'} font-sans antialiased overflow-hidden`}>
      {showSplash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ${isDarkMode ? 'bg-[#0f1115]' : 'bg-white'} ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center text-center w-full max-w-2xl px-6">
            <div className="relative mb-8 animate-scale-in">
              <div className="absolute inset-0 bg-brand-600/20 blur-3xl rounded-full"></div>
              <div className="relative w-40 h-40 rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center">
                <img src="/logo financeiro sem texto.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-brand-600">ORGANIZER</h2>
          </div>
        </div>
      )}

      <header className={`shrink-0 border-b ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} pt-safe px-4 md:px-6 z-40`}>
        <div className="max-w-6xl mx-auto py-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border border-black/5 dark:border-white/5 bg-black flex items-center justify-center shadow-sm">
                <img src="/logo financeiro sem texto.png" className="w-full h-full object-cover" alt="Logo" />
              </div>
              <div className="text-left">
                <h2 className={`text-xl font-black leading-none uppercase ${isDarkMode ? 'text-white' : 'text-brand-600'}`}>ORGANIZER</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Oficial</p>
              </div>
            </div>
            
            <div className="lg:hidden flex items-center gap-3">
              <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-slate-800/10 dark:bg-slate-800 text-brand-600 dark:text-amber-400">
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              
              <div onClick={() => setIsEditingProfile(true)} className="w-9 h-9 rounded-xl border-2 border-brand-600/20 flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-white dark:bg-[#0f1115]">
                {userAvatar ? (
                  <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black text-brand-600">{getInitials(userName)}</span>
                )}
              </div>
              
              <button onClick={handleLogout} className="p-2 text-rose-500"><LogOut className="w-4 h-4" /></button>
            </div>
          </div>

          <div className="flex items-center bg-brand-600 rounded-xl p-1 shadow-lg shadow-brand-600/20 w-full lg:w-auto justify-between">
            <button onClick={() => changeMonth(-1)} className="p-2 text-white active:scale-90"><ChevronLeft className="w-5 h-5" /></button>
            <span className="font-bold text-xs text-white capitalize min-w-[120px] text-center tracking-widest">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => changeMonth(1)} className="p-2 text-white active:scale-90"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-800/10 dark:bg-slate-800 text-brand-600 dark:text-amber-400 transition-all">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><LogOut className="w-5 h-5" /></button>
            <div onClick={() => setIsEditingProfile(true)} className="w-11 h-11 rounded-2xl border-2 border-brand-600/20 flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-white dark:bg-[#0f1115]">
              {userAvatar ? <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-brand-600">{getInitials(userName)}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 lg:pb-8 pt-6 px-4 text-left">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="lg:hidden flex bg-white dark:bg-[#161a20] rounded-2xl p-1 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-0 z-30">
            <button onClick={() => setActiveTab('summary')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'summary' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>Resumo</button>
            <button onClick={() => setActiveTab('form')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'form' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>Lançar</button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold transition-all ${activeTab === 'history' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-400'}`}>Extrato</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className={`lg:col-span-4 space-y-6 ${(activeTab === 'summary' || activeTab === 'form') ? 'block' : 'hidden lg:block'}`}>
              <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden ${activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Total</p>
                  <button onClick={() => setShowBalance(!showBalance)} className="text-slate-400">{showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                </div>
                <h2 className="text-3xl font-black text-left">{showBalance ? `R$ ${summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}</h2>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/10 dark:border-slate-800 text-left">
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Receitas</p>
                    <p className="text-emerald-500 font-black text-sm">{showBalance ? `+${summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '•••'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold">Despesas</p>
                    <p className="text-rose-500 font-black text-sm">{showBalance ? `-${summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '•••'}</p>
                  </div>
                </div>
              </div>

              <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-left">{editingId ? 'Editar' : 'Novo Lançamento'}</h3>
                <form onSubmit={handleSaveTransaction} className="space-y-4 text-left">
                  <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none focus:border-brand-500 text-sm" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" required step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none font-black text-base" />
                    <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-sm" />
                  </div>
                  <div className="flex gap-2 p-1 bg-black/5 dark:bg-slate-900 rounded-2xl transition-colors">
                    <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${type === 'income' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-400'}`}>RECEITA</button>
                    <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${type === 'expense' ? 'bg-white dark:bg-rose-500 text-rose-600 dark:text-white shadow-md' : 'text-slate-400'}`}>DESPESA</button>
                  </div>
                  <button type="submit" className="w-full py-5 rounded-2xl bg-brand-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all">Confirmar</button>
                </form>
              </div>
            </div>

            <div className={`lg:col-span-8 ${activeTab === 'history' ? 'block' : 'hidden lg:block'}`}>
              <div className={`rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} overflow-hidden min-h-[400px]`}>
                <div className="p-6 border-b border-slate-800/10 dark:border-slate-800 flex justify-between items-center bg-inherit">
                  <h3 className="text-xs font-black uppercase tracking-widest">Atividade Recente</h3>
                  <span className="text-[10px] font-black bg-brand-600/10 text-brand-600 px-3 py-1.5 rounded-lg">{filteredTransactions.length} registros</span>
                </div>
                <div className="divide-y divide-slate-800/10 dark:divide-slate-800">
                  {filteredTransactions.map((t) => (
                    <div key={t.id} className="p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                          <TrendingUp className={`w-5 h-5 ${t.type === 'expense' ? 'rotate-180' : ''}`} />
                        </div>
                        <div>
                          <p className="font-bold text-sm uppercase tracking-tight">{t.description}</p>
                          <p className="text-[9px] text-slate-500 font-black uppercase">{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <button onClick={() => removeTransaction(t.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all text-left"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM NAV */}
      <div className="lg:hidden shrink-0 bg-white dark:bg-[#161a20] border-t border-slate-200 dark:border-slate-800 px-6 py-3 pb-safe flex items-center justify-around z-50">
        <button onClick={() => setActiveTab('summary')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'summary' ? 'text-brand-600 scale-110' : 'text-slate-400 opacity-60'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">Início</span>
        </button>
        <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'form' ? 'text-brand-600' : 'text-slate-400'}`}>
          <div className="p-3 rounded-full bg-brand-600 text-white -mt-8 shadow-xl border-4 border-[#f4f5f7] dark:border-[#0f1115] active:scale-90 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">Lançar</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-brand-600 scale-110' : 'text-slate-400 opacity-60'}`}>
          <History className="w-6 h-6" />
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">Extrato</span>
        </button>
      </div>

      {/* MODAL CONFIGURAÇÃO PREMIUM */}
      {isEditingProfile && (
        <div className="fixed inset-0 backdrop-blur-2xl z-[110] flex items-center justify-center p-4 bg-black/60">
          <div className={`w-full max-w-[380px] rounded-[40px] overflow-hidden shadow-2xl border border-white/10 bg-[#0f1115] animate-in zoom-in duration-300`}>
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#7a0ae5]"></div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Personalizar Perfil</h2>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="relative w-32 h-32 mx-auto group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="absolute inset-0 bg-brand-600/20 blur-2xl rounded-full group-hover:bg-brand-600/40 transition-all"></div>
                <div className="relative w-full h-full rounded-[38px] border-2 border-white/10 overflow-hidden bg-black flex items-center justify-center transition-transform duration-500 group-hover:scale-105 group-hover:border-brand-500/50">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <User className="w-8 h-8 text-brand-600" />
                      <span className="text-[10px] font-black text-brand-600">{getInitials(userName)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6 mb-1" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Alterar</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-white/30 uppercase ml-1 tracking-widest">Nome de Exibição</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={tempName} 
                      onChange={(e) => setTempName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-brand-500 focus:bg-white/10 transition-all font-bold"
                      placeholder="Como quer ser chamado?"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10">
                      <Pencil className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 opacity-50">
                  <label className="text-[9px] font-black text-white/30 uppercase ml-1 tracking-widest">E-mail (Login)</label>
                  <input 
                    type="text" 
                    disabled 
                    value={session.user.email}
                    className="w-full bg-transparent border border-white/5 rounded-2xl px-5 py-4 text-xs text-white/60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={handleUpdateProfile}
                  disabled={uploading}
                  className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-600/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  {uploading ? 'Sincronizando...' : <><Check className="w-4 h-4" /> Salvar Alterações</>}
                </button>
                
                <button 
                  onClick={handleLogout}
                  className="w-full bg-white/5 text-rose-500 font-black py-4 rounded-2xl hover:bg-rose-500/10 active:scale-95 transition-all text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Encerrar Sessão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
