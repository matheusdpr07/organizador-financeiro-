import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Trash2, 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { format, parseISO, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Transaction, TransactionType } from './types';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('income');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    localStorage.setItem('finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => isSameMonth(parseISO(t.date), selectedMonth))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'income') acc.income += t.amount;
        else acc.expense += t.amount;
        acc.total = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, total: 0 }
    );
  }, [filteredTransactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount: Math.abs(Number(amount)),
      type,
      date,
      category: 'Geral',
    };

    setTransactions([newTransaction, ...transactions]);
    setDescription('');
    setAmount('');
  };

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setSelectedMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg pt-8 pb-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">FinançasApp</h1>
          </div>

          <div className="flex items-center bg-blue-700/50 rounded-full px-4 py-2">
            <button 
              onClick={() => changeMonth(-1)}
              className="hover:text-blue-200 transition-colors p-1"
              title="Mês Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="mx-4 font-medium min-w-[140px] text-center capitalize">
              {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <button 
              onClick={() => changeMonth(1)}
              className="hover:text-blue-200 transition-colors p-1"
              title="Próximo Mês"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-12">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Entradas (Lucro)</p>
              <p className="text-2xl font-bold text-gray-900">R$ {summary.income.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
            <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Saídas (Gasto)</p>
              <p className="text-2xl font-bold text-gray-900">R$ {summary.expense.toFixed(2)}</p>
            </div>
          </div>

          <div className={`p-6 rounded-2xl shadow-md border flex items-center gap-4 transition-transform hover:scale-[1.02] ${
            summary.total >= 0 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-rose-600 border-rose-600 text-white'
          }`}>
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-90 font-medium">Saldo Atual</p>
              <p className="text-2xl font-bold">R$ {summary.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-600" />
                Nova Transação
              </h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input
                    type="text"
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ex: Salário, Aluguel..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                      type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                      type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Saída
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold">Histórico do Mês</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {filteredTransactions.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhuma transação este mês.</p>
                  </div>
                ) : (
                  filteredTransactions.map((t) => (
                    <div key={t.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{t.description}</p>
                          <p className="text-xs text-gray-500 font-medium">{format(parseISO(t.date), 'dd/MM/yyyy')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold text-lg ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeTransaction(t.id)}
                          className="text-gray-300 hover:text-rose-600 p-2 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
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
  );
}

export default App;
