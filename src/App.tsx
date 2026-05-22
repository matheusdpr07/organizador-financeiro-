import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  TrendingUp, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff, Camera, Pencil, Moon, Sun, LayoutDashboard, History, LogOut, Plus, Check, User
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "./aws-config";
import * as Cognito from './cognito';
import SplitText from './SplitText';
import CountUp from './CountUp';
import Particles from './Particles';
import ShinyText from './ShinyText';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction, TransactionType } from './types';

const API_URL = 'http://localhost:3001/api';

function Login({ onLoginSuccess }: { onLoginSuccess: (session: any) => void }) {
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
        await Cognito.signUp(email, password, name || 'Usuário');
        setError('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      } else {
        const session = await Cognito.signIn(email, password);
        onLoginSuccess(session);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center p-4 overflow-hidden bg-[#050212]">
      <Particles particleCount={80} particleColor="#7a0ae5" speed={0.4} />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#1a0b2e_0%,#050212_100%)]"></div>
      
      <div className="relative z-10 w-full max-w-[360px] bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] shadow-2xl text-left">
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-8 group">
            <div className="absolute inset-0 bg-[#7a0ae5]/30 blur-[30px] rounded-full animate-pulse"></div>
            <div className="relative w-full h-full rounded-[38px] overflow-hidden border border-white/20 bg-black flex items-center justify-center">
              <img alt="Logo" src="/logo financeiro sem texto.png" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="flex justify-center mb-1">
            <SplitText text="ORGANIZER" className="text-3xl font-black uppercase tracking-[0.2em] text-white" animationSpeed={0.08} />
          </div>
          <p className="mt-2 text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase text-center">Inteligência Financeira</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {isRegistering && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">Seu Nome</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="Nome completo" />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">E-mail de Acesso</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="seu@email.com" />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-white/40 uppercase ml-1 tracking-widest">Sua Senha</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-[#7a0ae5] transition-all focus:bg-white/10" placeholder="••••••••" />
          </div>

          {error && <p className={`text-[10px] font-bold text-center p-3 rounded-xl ${error.includes('Cadastro') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#7a0ae5] text-white font-black py-5 rounded-2xl shadow-xl shadow-[#7a0ae5]/30 active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 mt-2 flex justify-center items-center">
            {loading ? 'Sincronizando...' : <ShinyText text={isRegistering ? 'Criar Conta' : 'Acessar Painel'} className="text-white font-black" />}
          </button>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold text-white/20 uppercase tracking-widest leading-loose">
          {isRegistering ? 'Já tem acesso?' : 'Ainda sem conta?'}<br/>
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-[#7a0ae5] hover:text-white transition-colors underline decoration-2 underline-offset-4 font-black">
            {isRegistering ? 'Fazer login agora' : 'Começar Agora'}
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
  const [avatarUrl, setAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar sessão inicial do Cognito
  useEffect(() => {
    Cognito.getSession().then(session => {
      if (session) {
        setSession(session);
        const payload = session.getIdToken().payload;
        if (payload.name) setTempName(payload.name);
        if (payload.picture) setAvatarUrl(payload.picture);
      }
    });
  }, []);

  // Efeito para carregar transações quando autenticado
  useEffect(() => {
    if (session) {
      const userSub = session.getIdToken().payload.sub;
      const fetchTransactions = async () => {
        try {
          const response = await fetch(`${API_URL}/transactions/${userSub}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setTransactions(data);
          } else {
            setTransactions([]);
          }
        } catch (error) {
          console.error("Erro ao carregar transações:", error);
          setTransactions([]);
        }
      };
      fetchTransactions();
    }
  }, [session]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setShowSplash(false), 1000);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('organizer_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    Cognito.signOut();
    setSession(null);
  };

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

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !session) return;
    const numericAmount = Math.abs(Number(amount));
    const newId = editingId || crypto.randomUUID();
    const userSub = session.getIdToken().payload.sub;

    const transactionData = {
      id: newId,
      description,
      amount: numericAmount,
      date,
      type,
      user_id: userSub
    };

    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        if (editingId) {
          setTransactions(transactions.map(t => t.id === editingId ? transactionData : t));
          setEditingId(null);
        } else {
          setTransactions([transactionData, ...transactions]);
        }
        setDescription(''); 
        setAmount(''); 
        setDate(format(new Date(), 'yyyy-MM-dd'));
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar lançamento.");
    }
  };

  const removeTransaction = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUploading(true);
      await Cognito.updateAttribute('name', tempName);
      // Atualizar a sessão local para refletir o nome novo sem precisar de F5
      if (session) {
        session.getIdToken().payload.name = tempName;
      }
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file || !session) return;
      
      const userSub = session.getIdToken().payload.sub;
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${userSub}-${Date.now()}.${fileExt}`;
      
      const arrayBuffer = await file.arrayBuffer();
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileName,
          Body: new Uint8Array(arrayBuffer),
          ContentType: file.type,
          ACL: "public-read",
        })
      );

      const publicUrl = `https://${BUCKET_NAME}.s3.sa-east-1.amazonaws.com/${fileName}`;
      
      await Cognito.updateAttribute('picture', publicUrl);
      setAvatarUrl(publicUrl);
      
    } catch (error: any) {
      console.error('Erro no upload:', error.message);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  return (
    <>
      <Particles particleCount={60} particleColor={isDarkMode ? "#7a0ae5" : "#7209b7"} speed={0.3} />
      {(!showSplash || isFadingOut) && (
        !session ? <Login onLoginSuccess={(s) => setSession(s)} /> : (
          <div className={`relative flex flex-col h-[100dvh] transition-colors duration-500 ${isDarkMode ? 'bg-[#0f1115] text-slate-100' : 'bg-[#f4f5f7] text-slate-900'} font-sans antialiased overflow-hidden`}>
            <header className={`shrink-0 border-b ${isDarkMode ? 'bg-[#161a20] border-slate-800' : 'bg-white border-slate-200'} pt-safe px-4 md:px-6 z-40`}>
              <div className="max-w-6xl mx-auto py-4 flex flex-col lg:flex-row items-center justify-between gap-4 text-left">
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
                    <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-slate-800/10 dark:bg-slate-800 text-brand-600 dark:text-amber-400"><Sun className="w-4 h-4" /></button>
                    <div onClick={() => setIsEditingProfile(true)} className="w-9 h-9 rounded-xl border-2 border-brand-600/20 flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-white dark:bg-[#0f1115]">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-black text-brand-600">{getInitials(tempName)}</span>
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
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-800/10 dark:bg-slate-800 text-brand-600 dark:text-amber-400 transition-all">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
                  <button onClick={handleLogout} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><LogOut className="w-5 h-5" /></button>
                  <div onClick={() => setIsEditingProfile(true)} className="w-11 h-11 rounded-2xl border-2 border-brand-600/20 flex items-center justify-center cursor-pointer transition-all overflow-hidden bg-white dark:bg-[#0f1115]">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-brand-600">{getInitials(tempName)}</span>
                    )}
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
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  <div className={`lg:col-span-4 space-y-6 ${(activeTab === 'summary' || activeTab === 'form') ? 'block' : 'hidden lg:block'} text-left`}>
                    <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden ${activeTab === 'summary' ? 'block' : 'hidden lg:block'} text-left`}>
                      <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Total</p>
                        <button onClick={() => setShowBalance(!showBalance)} className="text-slate-400">{showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                      </div>
                      <h2 className="text-3xl font-black text-left">{showBalance ? (<div className="flex items-center"><span>R$&nbsp;</span><CountUp to={summary.total} key={summary.total + 'total'} /></div>) : '••••••••'}</h2>
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/10 dark:border-slate-800">
                        <div><p className="text-[9px] text-slate-400 uppercase font-bold">Receitas</p><div className="text-emerald-500 font-black text-sm text-left">{showBalance ? (<div className="flex items-center"><span>+</span><CountUp to={summary.income} key={summary.income + 'income'} /></div>) : '•••'}</div></div>
                        <div><p className="text-[9px] text-slate-400 uppercase font-bold">Despesas</p><div className="text-rose-500 font-black text-sm text-left">{showBalance ? (<div className="flex items-center"><span>-</span><CountUp to={summary.expense} key={summary.expense + 'expense'} /></div>) : '•••'}</div></div>
                      </div>
                    </div>
                    <div className={`p-6 md:p-8 rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} ${activeTab === 'form' ? 'block' : 'hidden lg:block'} text-left`}>
                      <h3 className="font-black text-sm uppercase tracking-widest mb-6 text-left">Novo Lançamento</h3>
                      <form onSubmit={handleSaveTransaction} className="space-y-4">
                        <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição" className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none focus:border-brand-500 text-sm" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="number" required step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 outline-none font-black text-base" />
                          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-slate-700 text-sm" />
                        </div>
                        <div className="flex gap-2 p-1 bg-black/5 dark:bg-slate-900 rounded-2xl transition-colors">
                          <button type="button" onClick={() => setType('income')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${type === 'income' ? 'bg-white dark:bg-emerald-500 text-emerald-600 dark:text-white shadow-md' : 'text-slate-400'}`}>RECEITA</button>
                          <button type="button" onClick={() => setType('expense')} className={`flex-1 py-3 rounded-xl text-[10px] font-black transition-all ${type === 'expense' ? 'bg-white dark:bg-rose-500 text-rose-600 dark:text-white shadow-md' : 'text-slate-400'}`}>DESPESA</button>
                        </div>
                        <button type="submit" className="w-full py-5 rounded-2xl bg-brand-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all text-left flex justify-center items-center">
                          <ShinyText text="Confirmar Lançamento" className="text-white font-black" />
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className={`lg:col-span-8 ${activeTab === 'history' ? 'block' : 'hidden lg:block'} text-left`}>
                    <div className={`rounded-3xl border ${isDarkMode ? 'bg-[#161a20] border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} overflow-hidden min-h-[400px] text-left`}>
                      <div className="p-6 border-b border-slate-800/10 dark:border-slate-800 flex justify-between items-center bg-inherit">
                        <h3 className="text-xs font-black uppercase tracking-widest text-left">Atividade Recente</h3>
                        <span className="text-[10px] font-black bg-brand-600/10 text-brand-600 px-3 py-1.5 rounded-lg text-left">{filteredTransactions.length} registros</span>
                      </div>
                      <div className="divide-y divide-slate-800/10 dark:divide-slate-800 text-left">
                        {filteredTransactions.map((t) => (
                          <div key={t.id} className="p-5 flex items-center justify-between hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left">
                            <div className="flex items-center gap-4 text-left">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                <TrendingUp className={`w-5 h-5 ${t.type === 'expense' ? 'rotate-180' : ''}`} />
                              </div>
                              <div className="text-left"><p className="font-bold text-sm uppercase tracking-tight text-left">{t.description}</p><p className="text-[9px] text-slate-500 font-black uppercase text-left">{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</p></div>
                            </div>
                            <div className="flex items-center gap-4 text-left">
                              <p className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'} text-left`}>{t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
            <div className="lg:hidden shrink-0 bg-white dark:bg-[#161a20] border-t border-slate-200 dark:border-slate-800 px-6 py-3 pb-safe flex items-center justify-around z-50">
              <button onClick={() => setActiveTab('summary')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'summary' ? 'text-brand-600 scale-110' : 'text-slate-400 opacity-60'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-tighter text-center">Início</span></button>
              <button onClick={() => setActiveTab('form')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'form' ? 'text-brand-600' : 'text-slate-400'}`}><div className="p-3 rounded-full bg-brand-600 text-white -mt-8 shadow-xl border-4 border-[#f4f5f7] dark:border-[#0f1115] active:scale-90 transition-transform"><Plus className="w-6 h-6" /></div><span className="text-[9px] font-black uppercase tracking-tighter text-center">Lançar</span></button>
              <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-brand-600 scale-110' : 'text-slate-400 opacity-60'}`}><History className="w-6 h-6" /><span className="text-[9px] font-black uppercase tracking-tighter text-center">Extrato</span></button>
            </div>
            <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
              <DialogContent className="max-w-[380px] rounded-[40px] border-white/10 bg-[#0f1115] p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-left">
                <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between text-left">
                  <div className="flex items-center gap-2 text-left">
                    <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_#7a0ae5] text-left"></div>
                    <DialogTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 text-left">Personalizar Perfil</DialogTitle>
                  </div>
                </DialogHeader>
                <div className="p-8 space-y-8 text-left">
                  <div className="relative w-32 h-32 mx-auto group cursor-pointer text-left" onClick={() => fileInputRef.current?.click()}>
                    <div className="absolute inset-0 bg-brand-600/20 blur-2xl rounded-full group-hover:bg-brand-600/40 transition-all text-left"></div>
                    <div className="relative w-full h-full rounded-[38px] border-2 border-white/10 overflow-hidden bg-black flex items-center justify-center transition-transform duration-500 group-hover:scale-105 text-left">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-left"><User className="w-8 h-8 text-brand-600" /><span className="text-[10px] font-black text-brand-600 text-left">{getInitials(tempName)}</span></div>
                      )}
                      <div className="absolute inset-0 bg-brand-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-left"><Camera className="text-white w-6 h-6 mb-1" /><span className="text-[8px] font-black text-white uppercase tracking-widest text-left">Alterar</span></div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                  </div>
                  <div className="space-y-4 text-left">
                    <div className="space-y-1 text-left"><label className="text-[9px] font-black text-white/30 uppercase ml-1 tracking-widest text-left">Nome de Exibição</label><div className="relative text-left"><input type="text" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-brand-500 focus:bg-white/10 transition-all font-bold text-left" placeholder="Como quer ser chamado?" /><div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 text-left"><Pencil className="w-4 h-4" /></div></div></div>
                    <div className="space-y-1 opacity-50 text-left"><label className="text-[9px] font-black text-white/30 uppercase ml-1 tracking-widest text-left">E-mail (Login)</label><input type="text" disabled value={session?.getIdToken().payload.email} className="w-full bg-transparent border border-white/5 rounded-2xl px-5 py-4 text-xs text-white/60 cursor-not-allowed text-left" /></div>
                  </div>
                  <div className="space-y-3 pt-2 text-left">
                    <button onClick={handleUpdateProfile} className="w-full bg-brand-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-brand-600/20 active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-left"><Check className="w-4 h-4" /><ShinyText text="Salvar Alterações" className="text-white font-black" /></button>
                    <button onClick={handleLogout} className="w-full bg-white/5 text-rose-500 font-black py-4 rounded-2xl hover:bg-rose-500/10 active:scale-95 transition-all text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 text-left"><LogOut className="w-4 h-4" /> Encerrar Sessão</button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )
      )}
      {showSplash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-1000 ${isDarkMode ? 'bg-[#0f1115]' : 'bg-white'} ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col items-center text-center w-full max-w-2xl px-6">
            <div className="relative mb-8 animate-scale-in">
              <div className="absolute inset-0 bg-brand-600/20 blur-3xl rounded-full"></div>
              <div className="relative w-40 h-40 rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 bg-black flex items-center justify-center">
                <img src="/logo financeiro sem texto.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
            </div>
            <SplitText text="ORGANIZER" className="text-4xl font-black uppercase tracking-[0.2em] text-brand-600" animationSpeed={0.1} />
          </div>
        </div>
      )}
    </>
  );
}

export default App;
