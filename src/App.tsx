import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, TrendingUp, TrendingDown, Trash2, Calendar, Plus, ChevronLeft, ChevronRight, Crown, Trophy, AlertCircle, XCircle, Eye, EyeOff, Settings, Camera, Upload, X, Pencil, Save, Sparkles, Moon, Sun, LayoutDashboard, History
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, TransactionType, UserProfile } from './types';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('organizer_theme');
    return saved === 'dark';
  });
  
  // Estado para controlar as abas no Celular (Mobile Only)
  const [activeTab, setActiveTab] = useState<'summary' | 'form' | 'history'>('summary');
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nubank_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nubank_user');
    return saved ? JSON.parse(saved) : { name: 'Usuário', avatarUrl: '' };
  });

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
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('organizer_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('organizer_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => { localStorage.setItem('nubank_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('nubank_user', JSON.stringify(user)); }, [user]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => isSameMonth(parseISO(t.date), selectedMonth)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      acc.total = acc.income - acc.expense;
      return acc;
    }, { income: 0, expense: 0, total: 0 });
  }, [filteredTransactions]);

  const financialStatus = useMemo(() => {
    const { income, total } = summary;
    if (total < 0) return { label: 'Crítico', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20', icon: <XCircle className="w-4 h-4" /> };
    if (income === 0) return { label: 'Iniciante', color: 'text-neutral-500 dark:text-neutral-400', bgColor: 'bg-neutral-50 dark:bg-neutral-800', icon: <Sparkles className="w-4 h-4" /> };
    const ratio = total / income;
    if (ratio >= 0.5) return { label: 'Rei', color: 'text-brand-600 dark:text-brand-400', bgColor: 'bg-brand-50 dark:bg-brand-900/20', icon: <Crown className="w-4 h-4" /> };
    if (ratio >= 0.3) return { label: 'Ótimo', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', icon: <Trophy className="w-4 h-4" /> };
    return { label: 'Mediano', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', icon: <AlertCircle className="w-4 h-4" /> };
  }, [summary]);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;
    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? { ...t, description, amount: Math.abs(Number(amount)), type, date } : t));
      setEditingId(null);
    } else {
      const newTransaction: Transaction = { id: crypto.randomUUID(), description, amount: Math.abs(Number(amount)), type, date, category: 'Geral' };
      setTransactions([newTransaction, ...transactions]);
    }
    setDescription(''); setAmount(''); setDate(format(new Date(), 'yyyy-MM-dd'));
    // No mobile, volta para a aba de histórico após salvar
    if (window.innerWidth < 1024) setActiveTab('history');
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id); setDescription(transaction.description); setAmount(transaction.amount.toString()); setType(transaction.type); setDate(transaction.date);
    // No mobile, muda para a aba do formulário ao clicar em editar
    if (window.innerWidth < 1024) setActiveTab('form');
  };

  const cancelEdit = () => { setEditingId(null); setDescription(''); setAmount(''); setDate(format(new Date(), 'yyyy-MM-dd')); if (window.innerWidth < 1024) setActiveTab('history'); };
  const removeTransaction = (id: string) => { if (editingId === id) cancelEdit(); setTransactions(transactions.filter(t => t.id !== id)); };
  const changeMonth = (offset: number) => { const newMonth = new Date(selectedMonth); newMonth.setMonth(newMonth.getMonth() + offset); setSelectedMonth(newMonth); };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); reader.onloadend = () => setUser({ ...user, avatarUrl: reader.result as string }); reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'} font-sans selection:bg-brand-100 antialiased overflow-x-hidden`}>
      {/* SPLASH SCREEN */}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${isDarkMode ? 'bg-[#0f1115]' : 'bg-white'} ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center text-center w-full max-w-2xl px-6">
            <div className="relative mb-8 md:mb-12 animate-scale-in">
              <div className={`w-48 h-48 md:w-64 md:h-64 overflow-hidden rounded-[40px] md:rounded-[48px] shadow-2xl border ${isDarkMode ? 'border-slate-800 bg-[#161a20]' : 'border-slate-50 bg-white'}`}>
                <img src="/logo financeiro sem texto.png" alt="Organizer Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="space-y-4 animate-fade-in [animation-delay:0.6s] flex flex-col items-center">
              <h2 className={`text-4xl md:text-7xl font-black uppercase tracking-[0.2em] md:tracking-[0.5em] leading-none ml-[0.2em] md:ml-[0.5em] animate-fade-in [animation-delay:400ms] [animation-fill-mode:both] ${isDarkMode ? 'text-white' : 'text-brand-600'}`}>ORGANIZER</h2>
              <div className="h-1 w-32 md:w-48 bg-brand-500 rounded-full animate-fade-in [animation-delay:600ms] [animation-fill-mode:both]"></div>
            </div>
            <div className="mt-16 md:mt-24 flex gap-3">
              <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce"></div>
              <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <div className={`transition-all duration-1000 delay-300 ${isFadingOut ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <header className={`border-b transition-colors duration-500 ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} pt-4 pb-4 px-4 md:px-6 sticky top-0 z-40 backdrop-blur-md`}>
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full lg:w-auto">
              {/* LOGO E NOME */}
              <div className="flex items-center gap-4 group cursor-pointer self-start md:self-auto">
                <div className={`w-12 h-12 md:w-16 md:h-16 overflow-hidden rounded-2xl border shadow-sm transition-colors ${isDarkMode ? 'bg-[#0f1115] border-slate-700' : 'bg-white border-slate-100'}`}>
                  <img src="/logo financeiro sem texto.png" alt="Organizer Logo" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                </div>
                <div>
                  <h2 className={`text-base md:text-xl font-black leading-none tracking-tight uppercase ${isDarkMode ? 'text-white' : 'text-brand-600'}`}>ORGANIZER</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Plataforma Oficial</p>
                </div>
              </div>

              <div className="hidden md:block h-12 w-px bg-slate-200 dark:bg-slate-800"></div>

              {/* SELETOR DE MESES */}
              <div className="flex items-center bg-brand-600 rounded-lg p-1 shadow-md w-full md:w-auto justify-between md:justify-start">
                <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white/10 rounded-md transition-all text-white"><ChevronLeft className="w-4 h-4" /></button>
                <span className="mx-4 font-bold text-xs md:text-sm capitalize min-w-[120px] text-center text-white tracking-wide">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</span>
                <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white/10 rounded-md transition-all text-white"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-4 md:gap-6 w-full lg:w-auto">
              <div className={`flex items-center gap-2 md:gap-3 pr-4 md:pr-6 border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 md:p-2.5 rounded-lg transition-all ${isDarkMode ? 'bg-slate-800 text-amber-400' : 'bg-slate-50 text-slate-500'}`}>
                  {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                <button onClick={() => setShowBalance(!showBalance)} className="p-2 md:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">{showBalance ? <Eye className="w-4 h-4 md:w-5 md:h-5" /> : <EyeOff className="w-4 h-4 md:w-5 md:h-5" />}</button>
                <button className="p-2 md:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Settings className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
              
              {/* PERFIL */}
              <div className="flex items-center gap-3 md:gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Bem-vindo,</p>
                  <p className={`text-sm font-bold leading-none mb-2 ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>{user.name}</p>
                  <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-1.5 ml-auto text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest transition-all"><Pencil className="w-3 h-3" /> Ajustar</button>
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl border-2 overflow-hidden flex items-center justify-center cursor-pointer transition-all shadow-sm relative group ${isDarkMode ? 'bg-[#0f1115] border-slate-700 hover:border-brand-400' : 'bg-slate-50 border-slate-100 hover:border-brand-500'}`} onClick={() => setIsEditingProfile(true)}>
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="User" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-slate-400">{getInitials(user.name)}</span>}
                  <div className="absolute inset-0 bg-brand-600/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Camera className="w-4 h-4 text-brand-600" /></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8 pb-32 lg:pb-20">
          
          {/* TABS MOBILE (Visíveis apenas abaixo de 1024px) */}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            
            {/* LADO ESQUERDO: RESUMO E FORMULÁRIO */}
            <div className={`lg:col-span-4 space-y-8 ${(activeTab === 'summary' || activeTab === 'form') ? 'block' : 'hidden lg:block'}`}>
              
              {/* CARDS RESUMO (Visíveis no mobile apenas na tab 'summary') */}
              <div className={`space-y-6 ${activeTab === 'summary' ? 'block' : 'hidden lg:block'}`}>
                <div className={`p-8 rounded-2xl border transition-all relative overflow-hidden ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Patrimônio Líquido</p>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{showBalance ? `R$ ${summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}</h2>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase ${financialStatus.bgColor} ${financialStatus.color} border border-current/10 shadow-sm`}>{financialStatus.icon} {financialStatus.label}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-6 rounded-2xl border transition-all flex items-center gap-5 ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20"><TrendingUp className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Receitas</p><p className="text-xl font-bold text-emerald-500">{showBalance ? `+ R$ ${summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}</p></div>
                  </div>
                  <div className={`p-6 rounded-2xl border transition-all flex items-center gap-5 ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20"><TrendingDown className="w-5 h-5" /></div>
                    <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Despesas</p><p className="text-xl font-bold text-rose-500">{showBalance ? `- R$ ${summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}</p></div>
                  </div>
                </div>
              </div>

              {/* FORMULÁRIO (Visível no mobile apenas na tab 'form') */}
              <div className={`${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <div className={`p-8 md:p-10 rounded-2xl border transition-all duration-500 shadow-xl lg:sticky lg:top-32 ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} ${editingId ? 'ring-4 ring-brand-500/20 border-brand-500' : ''}`}>
                  <div className="flex items-center gap-3 mb-8 md:mb-10"><div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">{editingId ? <Pencil className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}</div><h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{editingId ? 'Editar registro' : 'Nova transação'}</h3></div>
                  <form onSubmit={handleSaveTransaction} className="space-y-6 md:space-y-8">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1 tracking-widest">Descrição</label><input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm font-medium ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-500 focus:bg-white'}`} placeholder="Ex: Salário" /></div>
                    <div className="grid grid-cols-1 gap-6">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1 tracking-widest">Valor do Fluxo</label><input type="number" required step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-black text-2xl ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-500 focus:bg-white'}`} placeholder="0,00" /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block ml-1 tracking-widest">Data</label><input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-sm font-medium ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-brand-500 focus:bg-white'}`} /></div>
                    </div>
                    <div className={`flex gap-2 p-1.5 rounded-xl ${isDarkMode ? 'bg-[#0f1115]' : 'bg-slate-100'}`}>
                      <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-lg text-[10px] font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-md dark:bg-emerald-500 dark:text-white' : 'text-slate-400'}`}>RECEITA</button>
                      <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-lg text-[10px] font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-md dark:bg-rose-500 dark:text-white' : 'text-slate-400'}`}>DESPESA</button>
                    </div>
                    <div className="pt-4"><button type="submit" className={`w-full text-white font-bold text-xs uppercase tracking-widest py-5 rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 ${editingId ? 'bg-emerald-600' : 'bg-brand-600'}`}>{editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}{editingId ? 'Salvar Edição' : 'Confirmar'}</button>{editingId && <button type="button" onClick={cancelEdit} className="w-full text-slate-400 font-bold py-3 mt-2 hover:text-rose-600 text-[10px] uppercase tracking-widest">Cancelar</button>}</div>
                  </form>
                </div>
              </div>
            </div>

            {/* LADO DIREITO: HISTÓRICO (Visível no mobile apenas na tab 'history') */}
            <div className={`lg:col-span-8 ${activeTab === 'history' ? 'block' : 'hidden lg:block'}`}>
              <div className={`rounded-2xl border transition-all overflow-hidden min-h-[600px] ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className={`px-6 md:px-10 py-6 border-b flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm ${isDarkMode ? 'bg-[#161a20]/80 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>Extrato de Operações</h3>
                  <span className="text-[10px] font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-lg border border-brand-100 dark:border-brand-800 uppercase tracking-widest">{filteredTransactions.length} registros</span>
                </div>
                <div className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {filteredTransactions.length === 0 ? (
                    <div className="py-64 text-center opacity-20 flex flex-col items-center"><Calendar className="w-20 h-20 mb-6 text-slate-300" /><p className={`font-black text-xs uppercase tracking-[0.5em] ${isDarkMode ? 'text-white' : 'text-slate-400'}`}>Sem atividades</p></div>
                  ) : (
                    filteredTransactions.map((t) => (
                      <div key={t.id} className={`px-6 md:px-10 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between transition-all group border-l-[8px] border-transparent ${editingId === t.id ? 'bg-brand-500/10 border-brand-500' : 'hover:bg-slate-500/5 hover:border-brand-500'}`}>
                        <div className="flex items-center gap-6 mb-4 sm:mb-0 w-full sm:w-auto">
                          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center border shadow-sm shrink-0 ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}><TrendingUp className="w-6 h-6 md:w-7 md:h-7" /></div>
                          <div className="min-w-0">
                            <p className={`font-bold text-base md:text-lg leading-none mb-2 uppercase tracking-tighter truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{t.description}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 w-full sm:w-auto">
                          <p className={`font-black text-xl md:text-2xl tracking-tighter ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => startEdit(t)} className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}><Pencil className="w-5 h-5" /></button>
                            <button onClick={() => removeTransaction(t.id)} className={`p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* BARRA DE NAVEGAÇÃO INFERIOR MOBILE */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-1000 delay-500 ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} border-t px-6 py-3 flex items-center justify-around pb-safe ${isFadingOut ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <button onClick={() => setActiveTab('summary')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'summary' ? 'text-brand-600' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
        </button>
        <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'form' ? 'text-brand-600' : 'text-slate-400'}`}>
          <div className={`p-2 rounded-full -mt-8 shadow-xl border-4 ${isDarkMode ? 'bg-brand-600 border-[#0f1115] text-white' : 'bg-brand-600 border-[#f4f5f7] text-white'}`}>
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Lançar</span>
        </button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-brand-600' : 'text-slate-400'}`}>
          <History className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Extrato</span>
        </button>
      </div>

      {/* MODAL CONFIGURAÇÃO */}
      {isEditingProfile && (
        <div className="fixed inset-0 backdrop-blur-md z-[110] flex items-center justify-center p-6 bg-slate-900/60">
          <div className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 ${isDarkMode ? 'bg-[#161a20]' : 'bg-white'}`}>
            <div className={`p-10 border-b flex justify-between items-center ${isDarkMode ? 'bg-[#0f1115] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              <h2 className={`text-xl font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Configuração</h2>
              <button onClick={() => setIsEditingProfile(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-10 space-y-10">
              <div className="flex flex-col items-center gap-6"><div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}><div className={`w-32 h-32 rounded-2xl border-4 overflow-hidden flex items-center justify-center shadow-inner transition-all ${isDarkMode ? 'bg-[#0f1115] border-slate-700 hover:border-brand-500' : 'bg-slate-50 border-slate-100 hover:border-brand-500'}`}>{user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-slate-200">{getInitials(user.name)}</span>}</div><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl text-white"><Camera className="w-8 h-8" /></div></div><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" /></div>
              <div className="space-y-6"><div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-[0.2em]">Nome do Gestor</label><input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className={`w-full px-4 py-3 rounded-xl border outline-none transition-all font-black text-2xl ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-white focus:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand-500 focus:bg-white'}`} /></div><div className="flex gap-4"><button onClick={() => fileInputRef.current?.click()} className={`flex-1 py-4 px-4 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-slate-400 hover:border-brand-500' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-brand-500'}`}><Upload className="w-4 h-4 mr-2 inline" /> Alterar</button><button onClick={() => setUser({ ...user, avatarUrl: '' })} className={`flex-1 py-4 px-4 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#0f1115] border-slate-700 text-slate-400 hover:border-rose-500' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-rose-500'}`}><Trash2 className="w-4 h-4 mr-2 inline" /> Limpar</button></div></div>
              <button onClick={() => setIsEditingProfile(false)} className="w-full bg-brand-600 text-white font-black py-6 rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all text-xs uppercase tracking-[0.3em]">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
