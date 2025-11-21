
import React, { useState, useRef } from 'react';
import { Sparkles, Loader2, Upload, FileText, X, Mail, FileUp, HelpCircle } from 'lucide-react';
import { parseCollabText } from '../services/geminiService';
import { CollaborationRequest, EmailConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface ImporterProps {
  onImport: (items: CollaborationRequest[]) => void;
  emailConfig: EmailConfig | null;
  onOpenSettings: () => void;
}

const Importer: React.FC<ImporterProps> = ({ onImport, emailConfig, onOpenSettings }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParse = async (inputText: string = text) => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Pass user email to service to filter out self-sent emails if needed
      const rawData = await parseCollabText(inputText, emailConfig?.email);
      const newItems: CollaborationRequest[] = rawData.map((item: any) => ({
        id: uuidv4(),
        brandName: item.brandName || '未知品牌',
        email: item.email || '',
        requestDate: item.requestDate || new Date().toISOString().split('T')[0],
        summary: item.summary || '无详细内容',
        budget: item.budget,
        status: 'pending',
        selected: false,
      }));
      onImport(newItems);
      setText(''); // Clear after success
    } catch (err) {
      setError('AI 解析遇到问题，请检查内容是否包含有效合作信息。');
    } finally {
      setLoading(false);
    }
  };

  const processFiles = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);

    const readers: Promise<string>[] = [];

    Array.from(files).forEach(file => {
      readers.push(new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          // Add headers for AI context
          const fileHeader = `\n--- START OF EMAIL FILE: ${file.name} ---\n`;
          resolve(`${fileHeader}${content}`);
        };
        reader.readAsText(file);
      }));
    });

    try {
      const results = await Promise.all(readers);
      const combinedText = results.join('\n');
      setText(prev => prev + combinedText);
      // Auto parse if it's files
      await handleParse(combinedText);
    } catch (err) {
      setError('文件读取失败，请确保是 .eml 或 .txt 格式');
      setLoading(false);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl">
            <Mail className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              邮件/消息导入
              <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">AI 驱动</span>
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {emailConfig?.email ? `当前账号: ${emailConfig.email}` : '未配置具体账号，仅作通用分析'}
            </p>
          </div>
        </div>
        
        <button 
          onClick={onOpenSettings}
          className="text-xs text-slate-400 hover:text-indigo-600 underline underline-offset-2 transition-colors"
        >
          配置 163 信息
        </button>
      </div>
      
      {/* Drag and Drop Area */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[200px]
          ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50'}
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-slate-800 font-medium">AI 正在读取并分析邮件...</h3>
            <p className="text-slate-500 text-sm mt-2">提取品牌方、预算、日期和关键信息</p>
          </div>
        ) : text ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-semibold text-slate-500 uppercase">已读取内容预览</span>
               <button 
                onClick={() => setText('')} 
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
               >
                 <X className="w-3 h-3" /> 清空
               </button>
            </div>
            <textarea
              className="w-full flex-1 min-h-[120px] p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs font-mono bg-white resize-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="解析的内容将显示在这里..."
            ></textarea>
            <div className="mt-4 flex justify-end">
               <button
                onClick={() => handleParse()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Sparkles className="w-4 h-4" />
                开始分析
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 bg-white rounded-full shadow-sm">
              <FileUp className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-slate-800 font-semibold text-lg mb-2">拖入邮件文件 (.eml) 或粘贴文本</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 leading-relaxed">
              支持批量拖拽多个 .eml 文件（从 163 导出）。<br/>
              或者直接粘贴微信聊天记录、后台私信、邮件正文。
            </p>
            
            <div className="flex gap-3">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".eml,.txt,.md,.csv"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                选择文件
              </button>
              <button 
                onClick={() => {
                    // Trigger paste if supported, otherwise just focus
                    navigator.clipboard.readText().then(clipText => setText(clipText)).catch(() => setText(' '));
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <FileText className="w-4 h-4" />
                粘贴文本
              </button>
            </div>
          </>
        )}
      </div>

      {!text && !loading && (
        <div className="mt-4 flex items-start gap-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
           <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
           <div className="text-xs text-blue-700">
              <strong>如何导出 163 邮件？</strong>
              <p className="mt-1 text-blue-600/80">
                在 163 网页版中，选中邮件 -> 点击上方“更多” -> 选择“导出”或“下载”，即可获得 .eml 文件。将这些文件拖入上方虚线框即可。
              </p>
           </div>
        </div>
      )}
    </div>
  );
};

export default Importer;
