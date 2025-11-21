import React, { useState, useEffect, useMemo } from 'react';
import { CollaborationRequest, ReplyTemplate, DateRange, EmailConfig } from './types';
import Importer from './components/Importer';
import TemplateEditor from './components/TemplateEditor';
import ReplyModal from './components/ReplyModal';
import EmailConnectModal from './components/EmailConnectModal';
import { 
  LayoutDashboard, 
  Settings, 
  Download, 
  Search, 
  Trash2, 
  MailCheck, 
  MailX, 
  CheckSquare, 
  Square,
  Mail
} from 'lucide-react';

// Default templates
const defaultTemplates: ReplyTemplate[] = [
  {
    id: 'yes',
    name: '接受合作 (Yes)',
    subject: '回复：关于 {brandName} 的合作意向确认',
    body: `您好，\n\n感谢贵品牌 {brandName} 的盛情邀请。我是博主本人。\n\n如果你是品牌方，我非常荣幸能有机会与贵品牌合作。我已经详细阅读了您的合作需求，觉得非常契合我的账号风格。\n\n请问是否有详细的Brief或产品资料可以进一步同步？期待进一步沟通。\n\n祝好，\n[您的名字]`
  },
  {
    id: 'no',
    name: '婉拒合作 (No)',
    subject: '回复：关于 {brandName} 的合作邀约',
    body: `您好，\n\n非常感谢 {brandName} 的关注与认可。\n\n经过慎重考虑，由于近期档期已满/内容规划原因，暂时无法承接此次合作。希望未来由于合适的机会能再续前缘。\n\n祝新品大卖！\n\n祝好，\n[您的名字]`
  }
];

function App() {
  // --- State ---
  const [requests, setRequests] = useState<CollaborationRequest[]>(() => {
    const saved = localStorage.getItem('collabflow_requests');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [templates, setTemplates] = useState<ReplyTemplate[]>(() => {
    const saved = localStorage.getItem('collabflow_templates');
    return saved ? JSON.parse(saved) : defaultTemplates;
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig | null>(() => {
    const saved = localStorage.getItem('collabflow_email_config');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<'dashboard' | 'templates'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateRange>({ start: '', end: '' });
  
  // Modals State
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  
  const [replyType, setReplyType] = useState<'yes' | 'no'>('yes');
  const [replySelection, setReplySelection] = useState<CollaborationRequest[]>([]);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('collabflow_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('collabflow_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    if (emailConfig) {
      localStorage.setItem('collabflow_email_config', JSON.stringify(emailConfig));
    }
  }, [emailConfig]);

  // --- Handlers ---

  const handleImport = (newItems: CollaborationRequest[]) => {
    setRequests(prev => [...newItems, ...prev]);
  };

  const toggleSelect = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const toggleSelectAll = () => {
    const allSelected = filteredRequests.every(r => r.selected);
    setRequests(prev => prev.map(r => {
      if (filteredRequests.find(fr => fr.id === r.id)) {
        return { ...r, selected: !allSelected };
      }
      return r;
    }));
  };

  const handleDeleteSelected = () => {
    if (confirm('确定删除选中的项目吗？')) {
      setRequests(prev => prev.filter(r => !r.selected));
    }
  };

  const handleReply = (type: 'yes' | 'no') => {
    const selected = requests.filter(r => r.selected);
    if (selected.length === 0) {
      alert('请先选择要回复的品牌');
      return;
    }
    setReplyType(type);
    setReplySelection(selected);
    setReplyModalOpen(true);
  };

  const handleMarkReplied = (ids: string[]) => {
    setRequests(prev => prev.map(r => ids.includes(r.id) ? { ...r, status: 'replied', selected: false } : r));
  };

  const handleExport = () => {
    if (!dateFilter.start || !dateFilter.end) {
      alert('请先选择导出时间范围');
      return;
    }

    const startDate = new Date(dateFilter.start);
    const endDate = new Date(dateFilter.end);
    
    const dataToExport = requests.filter(r => {
      const rDate = new Date(r.requestDate);
      return rDate >= startDate && rDate <= endDate;
    });

    if (dataToExport.length === 0) {
      alert('该时间段内无数据');
      return;
    }

    // Generate CSV
    const headers = ['日期,品牌名称,联系邮箱,摘要,预算,状态'];
    const rows = dataToExport.map(r => 
      `${r.requestDate},"${r.brandName.replace(/"/g, '""')}","${r.email}","${r.summary.replace(/"/g, '""')}","${r.budget || ''}",${r.status}`
    );
    
    const csvContent = "\uFEFF" + [headers, ...rows].join('\n'); // BOM for Excel chinese support
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `合作汇总_${dateFilter.start}_${dateFilter.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Filters ---
  const filteredRequests = useMemo(() => {
    return requests.filter(r => 
      (r.brandName.toLowerCase().includes(searchTerm.toLowerCase()) || r.summary.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [requests, searchTerm]);

  const selectedCount = requests.filter(r => r.selected).length;

  // --- Render ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col sticky top-0 h-auto md:h-screen z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            CollabFlow
          </h1>
          <p className="text-xs text-slate-400 mt-1">自媒体商务助手</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            合作管理
          </button>
          <button 
             onClick={() => setView('templates')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'templates' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings className="w-5 h-5" />
            模版设置
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800">
           <button 
             onClick={() => setEmailModalOpen(true)}
             className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors text-sm"
           >
              <Mail className="w-4 h-4" />
              {emailConfig?.enabled ? '已绑定 163 邮箱' : '绑定 163 邮箱'}
           </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-50 h-screen">
        {view === 'dashboard' ? (
          <div className="max-w-5xl mx-auto">
            {/* AI Importer with Sync */}
            <Importer 
              onImport={handleImport} 
              emailConfig={emailConfig}
              onOpenSettings={() => setEmailModalOpen(true)}
            />

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-20">
               <div className="flex items-center gap-3 w-full md:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="搜索品牌或内容..." 
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
               </div>

               <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  {selectedCount > 0 && (
                    <div className="flex items-center gap-2 mr-4 animate-fadeIn">
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">已选 {selectedCount}</span>
                      <button onClick={() => handleReply('yes')} className="flex items-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <MailCheck className="w-4 h-4" /> 接受
                      </button>
                      <button onClick={() => handleReply('no')} className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                        <MailX className="w-4 h-4" /> 婉拒
                      </button>
                      <button onClick={handleDeleteSelected} className="text-slate-400 hover:text-red-500 px-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block"></div>
                  
                  {/* Export Section */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <input 
                      type="date" 
                      className="bg-transparent text-xs border-none focus:ring-0 text-slate-600"
                      value={dateFilter.start}
                      onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
                    />
                    <span className="text-slate-400">-</span>
                    <input 
                      type="date" 
                      className="bg-transparent text-xs border-none focus:ring-0 text-slate-600"
                      value={dateFilter.end}
                      onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
                    />
                    <button onClick={handleExport} className="bg-slate-800 text-white p-1.5 rounded hover:bg-slate-700" title="导出 CSV">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
               </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-10">
                        <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                           {filteredRequests.length > 0 && filteredRequests.every(r => r.selected) ? 
                             <CheckSquare className="w-5 h-5 text-indigo-600" /> : 
                             <Square className="w-5 h-5" />
                           }
                        </button>
                      </th>
                      <th className="p-4">合作日期</th>
                      <th className="p-4">品牌方</th>
                      <th className="p-4">联系方式</th>
                      <th className="p-4 w-1/3">合作摘要</th>
                      <th className="p-4">预算</th>
                      <th className="p-4">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400">暂无数据，请先使用上方 AI 导入内容</td>
                      </tr>
                    ) : (
                      filteredRequests.map(req => (
                        <tr key={req.id} className={`hover:bg-slate-50 transition-colors ${req.selected ? 'bg-indigo-50/30' : ''}`}>
                          <td className="p-4">
                            <button onClick={() => toggleSelect(req.id)} className="text-slate-400">
                              {req.selected ? <CheckSquare className="w-5 h-5 text-indigo-600" /> : <Square className="w-5 h-5" />}
                            </button>
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-600">{req.requestDate}</td>
                          <td className="p-4 font-medium text-slate-800">{req.brandName}</td>
                          <td className="p-4 text-slate-500 font-mono text-xs">{req.email || '-'}</td>
                          <td className="p-4 text-slate-600 truncate max-w-xs" title={req.summary}>{req.summary}</td>
                          <td className="p-4 text-green-600 font-medium">{req.budget || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                              ${req.status === 'replied' ? 'bg-blue-100 text-blue-700' : 
                                req.status === 'declined' ? 'bg-red-100 text-red-700' :
                                req.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                              {req.status === 'replied' ? '已回复' : 
                               req.status === 'pending' ? '待处理' : req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
             <TemplateEditor 
               templates={templates} 
               onSave={setTemplates} 
             />
          </div>
        )}
      </main>

      {/* Modals */}
      <ReplyModal
        isOpen={replyModalOpen}
        onClose={() => setReplyModalOpen(false)}
        selectedRequests={replySelection}
        type={replyType}
        template={templates.find(t => t.id === replyType) || defaultTemplates[0]}
        onMarkReplied={handleMarkReplied}
        emailConfig={emailConfig}
      />
      
      <EmailConnectModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        config={emailConfig}
        onSave={setEmailConfig}
      />
    </div>
  );
}

export default App;