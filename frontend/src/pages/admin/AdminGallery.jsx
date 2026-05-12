import { useEffect, useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    try { const {data}=await api.get('/admin/gallery'); setImages(data.data.images||[]); } catch{}
  };
  useEffect(()=>{load();},[]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData(); fd.append('image', file);
        await api.post('/uploads/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast.success(`${files.length} image(s) uploaded`);
      load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Gallery</h1>
        <label className="btn btn-primary text-sm gap-1.5 cursor-pointer">
          <Upload size={16}/>{uploading?'Uploading...':'Upload Images'}
          <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading}/>
        </label>
      </div>
      {images.length === 0 ? (
        <div className="bg-gray-900 border-2 border-dashed border-gray-800 rounded-xl p-16 text-center">
          <Upload size={40} className="mx-auto mb-4 text-gray-600"/>
          <p className="text-gray-500">No images in gallery. Upload some to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img,i)=>(
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 group">
              <img src={img.url} alt="" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button className="w-9 h-9 bg-red-900/80 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-900"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
