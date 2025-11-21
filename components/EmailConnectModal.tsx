import React, { useState } from 'react';
import { X, Mail, Key, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { EmailConfig } from '../types';

interface EmailConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmailConfig | null;
  onSave: (config: EmailConfig) => void;
}

const EmailConnectModal: React.FC<EmailConnectModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [email, setEmail] = useState(config?.email || '');
  const [authCode, setAuthCode] = useState(config?.authCode || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!email) {
      setError('请输入邮箱地址');
      return;
    }
    
    setLoading(true);
    // Store config locally for potential future backend integration or signature usage
    setTimeout(() => {
      setLoading(false);
      onSave({ email, authCode, enabled: true });
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            163 邮箱配置
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold mb-1">关于自动同步的说明</p>
              <p className="opacity-90 mb-2">
                出于浏览器安全限制，网页版无法直接连接 163 IMAP 服务器进行自动同步。
              </p>
              <p className="font-semibold flex items-center gap-1">
                 <FileText className="w-3 h-3" />
                 推荐方案：请在主界面使用“上传文件”功能，拖入 .eml 邮件文件即可精准识别。
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">邮箱地址 (用于生成签名)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="example@163.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">授权码 (备用)</label>
            <div className="relative">
              <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="如需后期对接后端可填"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConnectModal;