import React, { useState } from 'react';
import { usePPDI } from '../context/PPDIContext';
import { Shield, Save, CheckCircle } from 'lucide-react';

export const RoleManagementView: React.FC = () => {
  const { appSettings, updateAppSettings } = usePPDI();
  const [permissions, setPermissions] = useState(appSettings.rolePermissions || {});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePermissionChange = (role: string, module: string, action: string, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [module]: {
          ...prev[role][module],
          [action]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateAppSettings({ ...appSettings, rolePermissions: permissions });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Tingkatan & Hak Akses (Role)</h2>
        <button onClick={handleSave} className="px-4 py-2 bg-emerald-700 text-white rounded-lg flex items-center gap-2 cursor-pointer hover:bg-emerald-800">
          <Save className="w-4 h-4" />
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
      
      {success && <div className="p-4 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-2"><CheckCircle /> Berhasil disimpan!</div>}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {Object.keys(permissions).map(role => (
          <div key={role} className="p-4 border-b">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Shield className="text-emerald-700"/> {role}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(permissions[role]).map(module => (
                <div key={module} className="p-3 bg-neutral-50 rounded border">
                  <h4 className="font-semibold text-sm capitalize mb-2">{module}</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Object.keys(permissions[role][module]).map(action => (
                      <label key={action} className="flex items-center gap-1">
                        <input 
                          type="checkbox" 
                          checked={permissions[role][module][action]}
                          onChange={(e) => handlePermissionChange(role, module, action, e.target.checked)}
                        />
                        {action}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
