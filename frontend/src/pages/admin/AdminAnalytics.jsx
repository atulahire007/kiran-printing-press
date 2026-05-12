import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const COLORS = ['#DC2626','#2563EB','#16A34A','#D97706','#7C3AED'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminAnalytics() {
  const [sales, setSales] = useState([]);
  const [catRevenue, setCatRevenue] = useState([]);
  const [growth, setGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(()=>{
    const load = async () => {
      try {
        const [s,c,g] = await Promise.all([
          api.get('/analytics/sales-chart?period='+period),
          api.get('/analytics/revenue-by-category'),
          api.get('/analytics/customer-growth'),
        ]);
        setSales(s.data.data.chart.map(d=>({ name: MONTHS[(d._id.month||1)-1]+(period==='daily'?'/'+d._id.day:''), revenue: Math.round(d.revenue), orders: d.orders })));
        setCatRevenue(c.data.data.categories.map(d=>({ name: d.categoryName, revenue: Math.round(d.revenue), orders: d.orders })));
        setGrowth(g.data.data.growth.map(d=>({ name: MONTHS[(d._id.month||1)-1], users: d.newUsers })));
      } catch(e){ console.error(e); }
      finally { setLoading(false); }
    };
    load();
  },[period]);

  if(loading) return <div className="text-center text-gray-500 py-20">Loading analytics...</div>;

  const chartProps = { contentStyle:{background:'#1F2937',border:'1px solid #374151',borderRadius:8,color:'#F9FAFB'} };
  const axisProps = { tick:{fill:'#6B7280',fontSize:11}, axisLine:false, tickLine:false };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Analytics</h1>
        <div className="flex gap-1.5 bg-gray-800 rounded-lg p-1">
          {['daily','monthly'].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)} className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${period===p?'bg-primary text-white':'text-gray-400 hover:text-white'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* Sales chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-bold text-white mb-5">Revenue Over Time</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={sales}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
            <XAxis dataKey="name" {...axisProps}/>
            <YAxis {...axisProps} tickFormatter={v=>v>=1000?`₹${(v/1000).toFixed(0)}k`:`₹${v}`}/>
            <Tooltip {...chartProps} formatter={(v,n)=>[n==='revenue'?`₹${v.toLocaleString('en-IN')}`:v, n==='revenue'?'Revenue':'Orders']}/>
            <Line type="monotone" dataKey="revenue" stroke="#DC2626" strokeWidth={2.5} dot={false}/>
            <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} dot={false} strokeDasharray="5 5"/>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by category */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-5">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={catRevenue.slice(0,7)} layout="vertical" margin={{left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false}/>
              <XAxis type="number" {...axisProps} tickFormatter={v=>`₹${(v/1000).toFixed(0)}k`}/>
              <YAxis type="category" dataKey="name" tick={{fill:'#6B7280',fontSize:10}} axisLine={false} tickLine={false} width={80}/>
              <Tooltip {...chartProps} formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'Revenue']}/>
              <Bar dataKey="revenue" radius={[0,4,4,0]}>
                {catRevenue.slice(0,7).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Customer growth */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="font-bold text-white mb-5">Customer Growth</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151"/>
              <XAxis dataKey="name" {...axisProps}/>
              <YAxis {...axisProps}/>
              <Tooltip {...chartProps}/>
              <Bar dataKey="users" fill="#16A34A" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
