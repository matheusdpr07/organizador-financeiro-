import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, TrendingUp, TrendingDown, Trash2, Calendar, Plus, ChevronLeft, ChevronRight, User, Crown, Trophy, CheckCircle2, AlertCircle, XCircle, Eye, EyeOff, Settings, Bell, Camera, Upload, X, Pencil, Save
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, TransactionType, UserProfile } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nubank_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('nubank_user');
    return saved ? JSON.parse(saved) : { name: 'Seu Nome', avatarUrl: '' };
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  
  // Estados do Formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (total < 0) return { label: 'Péssimo Economista', color: 'text-rose-600', bgColor: 'bg-rose-100', icon: <XCircle className="w-5 h-5" /> };
    if (income === 0) return { label: 'Iniciante', color: 'text-gray-500', bgColor: 'bg-gray-100', icon: <AlertCircle className="w-5 h-5" /> };
    const ratio = total / income;
    if (ratio >= 0.5) return { label: 'Rei de Finanças', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: <Crown className="w-5 h-5 fill-purple-700" /> };
    if (ratio >= 0.3) return { label: 'Ótimo em Finanças', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: <Trophy className="w-5 h-5" /> };
    if (ratio >= 0.15) return { label: 'Bom Economista', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: <CheckCircle2 className="w-5 h-5" /> };
    return { label: 'Economista Mediano', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: <AlertCircle className="w-5 h-5" /> };
  }, [summary]);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    if (editingId) {
      // Modo Edição
      setTransactions(transactions.map(t => 
        t.id === editingId 
          ? { ...t, description, amount: Math.abs(Number(amount)), type, date }
          : t
      ));
      setEditingId(null);
    } else {
      // Modo Criação
      const newTransaction: Transaction = { id: crypto.randomUUID(), description, amount: Math.abs(Number(amount)), type, date, category: 'Geral' };
      setTransactions([newTransaction, ...transactions]);
    }

    setDescription('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const startEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setDescription(transaction.description);
    setAmount(transaction.amount.toString());
    setType(transaction.type);
    setDate(transaction.date);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDescription('');
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const removeTransaction = (id: string) => {
    if (editingId === id) cancelEdit();
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const changeMonth = (offset: number) => { const newMonth = new Date(selectedMonth); newMonth.setMonth(newMonth.getMonth() + offset); setSelectedMonth(newMonth); };
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader(); reader.onloadend = () => setUser({ ...user, avatarUrl: reader.result as string }); reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-12 font-sans selection:bg-purple-200">
      {/* NUBANK HEADER */}
      <header className="bg-[#820ad1] text-white pt-6 pb-28 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all relative group" onClick={() => setIsEditingProfile(true)}>
                {user.avatarUrl ? <img src={user.avatarUrl} alt="Perfil" className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{getInitials(user.name)}</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full"><Camera className="w-5 h-5 text-white" /></div>
              </div>
              <div><p className="text-xs font-medium text-white/70">Olá,</p><h1 className="text-xl font-bold tracking-tight">{user.name}</h1></div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowBalance(!showBalance)} className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 transition-colors shadow-sm">{showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}</button>
              <button className="bg-white/10 p-2.5 rounded-full hover:bg-white/20 shadow-sm"><Settings className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex items-center bg-white/10 self-start rounded-2xl px-5 py-2.5 w-fit border border-white/5 backdrop-blur-sm">
            <button onClick={() => changeMonth(-1)} className="hover:text-purple-200 transition-all active:scale-75"><ChevronLeft className="w-6 h-6" /></button>
            <span className="mx-6 font-bold min-w-[130px] text-center capitalize text-sm tracking-wide">{format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}</span>
            <button onClick={() => changeMonth(1)} className="hover:text-purple-200 transition-all active:scale-75"><ChevronRight className="w-6 h-6" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-16 space-y-8 relative z-10">
        <div className="bg-white p-10 rounded-[28px] shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Saldo em conta</p>
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">{showBalance ? `R$ ${summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••••'}</h2>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${financialStatus.bgColor} ${financialStatus.color} border-current/20 font-bold text-xs uppercase tracking-tight shadow-sm`}>{financialStatus.icon} {financialStatus.label}</div>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-gray-50 pt-8">
            <div className="space-y-1"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Entradas</span><p className="text-emerald-600 font-bold text-2xl tracking-tight leading-none">{showBalance ? `+ R$ ${summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}</p></div>
            <div className="space-y-1 border-l border-gray-50 pl-6"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Saídas</span><p className="text-rose-600 font-bold text-2xl tracking-tight leading-none">{showBalance ? `- R$ ${summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '••••••'}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className={`bg-white p-8 rounded-[28px] shadow-sm border transition-all duration-500 sticky top-4 ${editingId ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-100'}`}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                {editingId ? <Pencil className="w-5 h-5 text-[#820ad1]" /> : <PlusCircle className="w-5 h-5 text-[#820ad1]" />}
                {editingId ? 'Editar Transação' : 'Movimentação'}
              </h3>
              <form onSubmit={handleSaveTransaction} className="space-y-6">
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-0 py-3 border-b-2 border-gray-50 focus:border-[#820ad1] outline-none transition-all text-sm font-medium placeholder:text-gray-300" placeholder="Descrição" />
                <input type="number" required step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-0 py-3 border-b-2 border-gray-50 focus:border-[#820ad1] outline-none transition-all font-bold text-2xl placeholder:text-gray-300" placeholder="R$ 0,00" />
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-0 py-3 border-b-2 border-gray-50 focus:border-[#820ad1] outline-none transition-all text-sm font-medium text-gray-500" />
                
                <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl mt-4">
                  <button type="button" onClick={() => setType('income')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>Receita</button>
                  <button type="button" onClick={() => setType('expense')} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-400'}`}>Gasto</button>
                </div>

                <div className="space-y-3">
                  <button type="submit" className={`w-full text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 ${editingId ? 'bg-emerald-600 shadow-emerald-100' : 'bg-[#820ad1] shadow-purple-100'}`}>
                    {editingId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingId ? 'Salvar Alterações' : 'Adicionar'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="w-full text-gray-400 font-bold py-2 hover:text-rose-600 transition-colors text-sm">Cancelar Edição</button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-gray-800">Histórico</h3>
                <span className="text-xs font-bold text-[#820ad1] bg-purple-50 px-3 py-1 rounded-full">{filteredTransactions.length} registros</span>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredTransactions.length === 0 ? (
                  <div className="py-32 text-center opacity-30 flex flex-col items-center"><Calendar className="w-16 h-16 mb-4" /><p className="font-bold text-sm tracking-wide uppercase">Sem movimentações</p></div>
                ) : (
                  filteredTransactions.map((t) => (
                    <div key={t.id} className={`p-8 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group ${editingId === t.id ? 'bg-purple-50/50' : ''}`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.type === 'income' ? <TrendingUp className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 leading-tight mb-1">{t.description}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{format(parseISO(t.date), "dd 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <p className={`font-bold text-xl tracking-tight ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => startEdit(t)} className="text-gray-300 hover:text-emerald-600 p-2"><Pencil className="w-5 h-5" /></button>
                          <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-rose-600 p-2"><Trash2 className="w-5 h-5" /></button>
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

      {/* MODAL PERFIL */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#820ad1] p-12 text-center relative">
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-8 right-8 text-white/40 hover:text-white"><X className="w-7 h-7" /></button>
              <div className="w-32 h-32 rounded-full bg-white/20 border-4 border-white/30 overflow-hidden flex items-center justify-center mx-auto mb-6 cursor-pointer shadow-xl transition-all hover:scale-105 relative group" onClick={() => fileInputRef.current?.click()}>
                {user.avatarUrl ? <img src={user.avatarUrl} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-4xl font-bold text-white">{getInitials(user.name)}</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full"><Camera className="w-8 h-8 text-white" /></div>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Editar Perfil</h2>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label><input type="text" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-[#820ad1] outline-none transition-all font-bold text-xl text-gray-800" /></div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-gray-50 hover:border-[#820ad1] hover:text-[#820ad1] transition-all text-xs font-bold text-gray-500"><Upload className="w-4 h-4" /> Foto</button>
                <button onClick={() => setUser({ ...user, avatarUrl: '' })} className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-gray-50 hover:border-rose-200 hover:text-rose-600 transition-all text-xs font-bold text-gray-500"><Trash2 className="w-4 h-4" /> Limpar</button>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="w-full bg-[#820ad1] text-white font-bold py-5 rounded-2xl shadow-lg shadow-purple-100 transition-all hover:brightness-110 active:scale-95">Salvar Perfil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
