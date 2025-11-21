
import React, { useState } from 'react';
import { CollaborationRequest, ReplyTemplate, EmailConfig } from '../types';
import { X, Copy, Check, ChevronRight, ChevronLeft, Mail, ExternalLink } from 'lucide-react';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequests: CollaborationRequest[];
  type: 'yes' | 'no';
  template: ReplyTemplate;
  onMarkReplied: (ids: string[]) => void;
  emailConfig: EmailConfig | null;
}

const ReplyModal: React.FC<ReplyModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedRequests, 
  type, 
  template, 
  onMarkReplied,
  emailConfig 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [repliedIds, setRepliedIds] = useState<Set<string>>(new Set());

  if (!isOpen || selectedRequests.length === 0) return null;

  const currentRequest = selectedRequests[currentIndex];
  
  // Generate content
  const subject = template.subject.replace(/{brandName}/g, currentRequest.brandName);
  const body = template.body.replace(/{brandName}/g, currentRequest.brandName);
  
  // Prepare mailto link (The most robust way to connect to local mail client)
  const mailtoLink = `mailto:${currentRequest.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyState(label);
    setTimeout(() => setCopyState(null), 1500);
  };

  const handleOpenMailClient = () => {
    window.open(mailtoLink, '_self'); // _self often works better for mailto to avoid blocked popups
    
    const newSet = new Set(repliedIds);
    newSet.add(currentRequest.id);
    setRepliedIds(newSet);
    
    // Optional: auto-advance preference could go here
  };

  const handleNext = () => {
    if (currentIndex < selectedRequests.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  const handleDone = () => {
    onMarkReplied(Array.from(repliedIds));
    onClose();
  };

  const isLast = currentIndex === selectedRequests.length - 1;
  const isFirst = currentIndex === 0;
  const isCurrentReplied = repliedIds.has(currentRequest.id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] animate-scaleIn">
        {/* Header */}
        <div className={`p-6 rounded-t-2xl flex justify-between items-center border-b ${type === 'yes' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div>
            <div className="flex items-center gap-2">
               <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${type === 'yes' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                 {type === 'yes' ? 'ACCEPT' : 'DECLINE'}
               </span>
               <h3 className={`text-lg font-bold ${type === 'yes' ? 'text-green-900' : 'text-red-900'}`}>
                 回复预览 ({currentIndex + 1}/{selectedRequests.length})
               </h3>
            </div>
            <p className="text-sm text-slate-600 mt-2 flex items-center gap-2">
              致: <span className="font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">{currentRequest.email}</span>
              <span className="text-slate-400">|</span>
              品牌: <span className="font-semibold">{currentRequest.brandName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-full transition-colors text-slate-500">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30 space-y-6">
          
          {/* Subject Field */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm group hover:border-indigo-300 transition-colors">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">邮件标题 (Subject)</label>
              <button 
                onClick={() => handleCopy(subject, 'subject')}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copyState === 'subject' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copyState === 'subject' ? '已复制' : '复制'}
              </button>
            </div>
            <div className="text-sm text-slate-800 font-medium select-all">{subject}</div>
          </div>

          {/* Body Field */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm group hover:border-indigo-300 transition-colors flex-1">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">邮件正文 (Body)</label>
              <button 
                onClick={() => handleCopy(body, 'body')}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {copyState === 'body' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copyState === 'body' ? '已复制' : '复制'}
              </button>
            </div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed select-all min-h-[150px]">
              {body}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white rounded-b-2xl flex flex-col gap-4">
          
          <div className="flex items-center gap-4">
             <button
               onClick={handleOpenMailClient}
               className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${
                 isCurrentReplied 
                   ? 'bg-slate-500 hover:bg-slate-600 ring-4 ring-slate-100' 
                   : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-50'
               }`}
             >
               {isCurrentReplied ? <Check className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
               {isCurrentReplied ? '已尝试发送' : '启动邮件 APP 发送'}
             </button>
             
             <a 
                href={`https://mail.163.com/`} 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium flex flex-col items-center justify-center text-xs gap-1 min-w-[100px]"
             >
                <ExternalLink className="w-4 h-4" />
                去网页版
             </a>
          </div>
          
          {/* Pagination */}
          <div className="flex justify-between items-center pt-2">
             <button 
                onClick={handlePrev} 
                disabled={isFirst}
                className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-600 disabled:opacity-30 hover:bg-slate-100 font-medium"
             >
                <ChevronLeft className="w-4 h-4 mr-1" /> 上一个
             </button>
             
             <div className="flex flex-col items-center gap-1">
                 <div className="flex gap-1.5">
                   {selectedRequests.map((_, idx) => (
                     <div 
                       key={idx} 
                       className={`w-2 h-2 rounded-full transition-colors ${
                         idx === currentIndex ? 'bg-indigo-600 scale-125' : 
                         repliedIds.has(selectedRequests[idx].id) ? 'bg-green-400' : 'bg-slate-200'
                       }`}
                     />
                   ))}
                 </div>
             </div>

             {isLast ? (
                <button 
                  onClick={handleDone} 
                  className="flex items-center px-4 py-2 rounded-lg text-sm text-white bg-slate-900 hover:bg-slate-800 font-medium"
                >
                    完成所有
                </button>
             ) : (
               <button 
                  onClick={handleNext} 
                  className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-600 disabled:opacity-30 hover:bg-slate-100 font-medium"
               >
                  下一个 <ChevronRight className="w-4 h-4 ml-1" />
               </button>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyModal;
