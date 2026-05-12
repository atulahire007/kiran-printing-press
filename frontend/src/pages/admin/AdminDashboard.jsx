import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#DC2626','#2563EB','#16A34A','#D97706','#7C3AED','#0891B2'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [salesChart, setSalesChart] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, c, d, p] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/sales-chart?period=monthly'),
          api.get('/analytics/order-status'),
          api.get('/analytics/top-products?limit=5'),
        ]);
        setStats(s.data.data.stats);
        setSalesChart(c.data.data.chart.map(d => ({ name: MONTHS[(d._id.month||1)-1], revenue: Math.round(d.revenue), orders: d.orders })));
        setStatusDist(d.data.data.distribution.map(d => ({ name: d._id.charAt(0).toUpperCase() + d._id.slice(1), value: d.count })));
        setTopProducts(p.data.data.products);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">{[...Array(4)].map((_,i) => <div key={i} className="h-28 bg-gray-800 rounded-xl"/>)}</div>;

  const stat = (icon, label, value, sub, color='text-primary bg-red-900/30') => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5">Welcome back! Here is what is happening at Kiran Printing Press.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stat(<TrendingUp size={20}/>, 'Total Revenue', `₹${(stats?.revenue?.total||0).toLocaleString('en-IN')}`, `This month: ₹${(stats?.revenue?.month||0).toLocaleString('en-IN')}`)}
        {stat(<ShoppingBag size={20}/>, 'Total Orders', (stats?.orders?.total||0).toLocaleString(), `${stats?.orders?.pending||0} pending`, 'text-blue-400 bg-blue-900/30')}
        {stat(<Users size={20}/>, 'Customers', (stats?.users?.total||0).toLocaleString(), `+${stats?.users?.newThisMonth||0} this month`, 'text-green-400 bg-green-900/30')}
        {stat(<Package size={20}/>, 'Products', (stats?.products?.active||0).toLocaleString(), `${stats?.orders?.processing||0} in production`, 'text-amber-400 bg-amber-900/30')}
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-5">Revenue and Orders (12 months)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={salesChart} margin={{top:5,right:5,bottom:5,left:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
              <XAxis dataKey="name" tick={{fill:'#6B7280',fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#6B7280',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>v>=1000?`₹${(v/1000).toFixed(0)}k`:`₹${v}`}/>
              <Tooltip contentStyle={{background:'#1F2937',border:'1px solid #374151',borderRadius:8,color:'#F9FAFB'}}/>
              <Line type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2.5} dot={false}/>
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="5 5"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-4">Order Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                {statusDist.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'#1F2937',border:'1px solid #374151',borderRadius:8}}/>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5">
            {statusDist.slice(0,5).map((s,i)=>(
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/>
                  <span className="text-gray-400">{s.name}</span>
                </div>
                <span className="font-medium text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Top Products</h2>
            <Link to="/admin/products" className="text-xs text-primary hover:underline flex items-center gap-1">View All <ArrowUpRight size={12}/></Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p,i)=>(
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-600 w-5">{i+1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.totalSold} sold</p>
                </div>
                <span className="text-sm font-semibold text-primary">₹{p.basePrice?.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {to:'/admin/orders',icon:<ShoppingBag size={20}/>,label:'View Orders',badge:stats?.orders?.pending,cl:'text-blue-400 bg-blue-900/30'},
              {to:'/admin/products',icon:<Package size={20}/>,label:'Add Product',cl:'text-green-400 bg-green-900/30'},
              {to:'/admin/users',icon:<Users size={20}/>,label:'Manage Users',cl:'text-purple-400 bg-purple-900/30'},
              {to:'/admin/analytics',icon:<TrendingUp size={20}/>,label:'Analytics',cl:'text-amber-400 bg-amber-900/30'},
            ].map(({to,icon,label,badge,cl})=>(
              <Link key={to} to={to} className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors text-center">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center relative ${cl}`}>
                  {icon}
                  {badge>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
                </div>
                <span className="text-xs font-medium text-gray-300">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
