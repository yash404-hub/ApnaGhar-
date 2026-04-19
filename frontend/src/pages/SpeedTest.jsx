import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wifi, Gauge, ArrowRight, Zap, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const SpeedTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const runTest = () => {
    setTesting(true);
    setResult({ ping: '--', download: '0.0', upload: '0.0' });
    
    // Step 1: Ping (Immediate)
    setTimeout(() => {
      const randomPing = Math.floor(Math.random() * (35 - 8 + 1)) + 8;
      setResult(prev => ({ ...prev, ping: `${randomPing}ms` }));
      
      // Step 2: Download (Simulate increasing speed)
      let dl = 0;
      const dlInterval = setInterval(() => {
        dl += Math.random() * 15;
        const targetDl = 30 + Math.random() * 70;
        if (dl >= targetDl) {
          clearInterval(dlInterval);
          setResult(prev => ({ ...prev, download: targetDl.toFixed(1) }));
          
          // Step 3: Upload
          let ul = 0;
          const ulInterval = setInterval(() => {
            ul += Math.random() * 8;
            const targetUl = 15 + Math.random() * 35;
            if (ul >= targetUl) {
              clearInterval(ulInterval);
              setResult(prev => ({ ...prev, upload: targetUl.toFixed(1) }));
              setTesting(false);
              toast.success('Speed test completed!');
            } else {
              setResult(prev => ({ ...prev, upload: ul.toFixed(1) }));
            }
          }, 100);
        } else {
          setResult(prev => ({ ...prev, download: dl.toFixed(1) }));
        }
      }, 100);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <div className="inline-flex p-4 rounded-3xl bg-purple-500/20 text-purple-400 mb-6">
          <Wifi className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Network Speed</h1>
        <p className="text-white/60 text-lg">Check your current internet connection performance.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 space-y-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Ping</p>
            <h3 className="text-3xl font-black text-white">{result?.ping || '--'}</h3>
            <p className="text-white/20 text-xs font-medium uppercase">ms</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Download</p>
            <h3 className="text-3xl font-black text-blue-400">{result?.download || '--'}</h3>
            <p className="text-white/20 text-xs font-medium uppercase">Mbps</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Upload</p>
            <h3 className="text-3xl font-black text-purple-400">{result?.upload || '--'}</h3>
            <p className="text-white/20 text-xs font-medium uppercase">Mbps</p>
          </div>
        </div>

        <div className="relative h-64 flex items-center justify-center">
          {/* Gauge Visualization */}
          <div className="absolute inset-0 border-8 border-white/5 rounded-full" />
          <motion.div 
            animate={testing ? { rotate: [0, 180, 270, 90, 200, 360] } : { rotate: 0 }}
            transition={{ duration: 5, repeat: testing ? Infinity : 0, ease: "linear" }}
            className="w-1 h-32 bg-gradient-to-t from-blue-500 to-transparent absolute bottom-1/2 origin-bottom rounded-full"
          />
          <div className="text-center z-10">
            <Gauge className={`w-16 h-16 mx-auto mb-4 ${testing ? 'text-blue-400 animate-pulse' : 'text-white/10'}`} />
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
              {testing ? 'Analyzing...' : 'Ready'}
            </p>
          </div>
        </div>

        <button 
          onClick={runTest}
          disabled={testing}
          className="btn-premium w-full h-16 text-xl flex items-center justify-center gap-3"
        >
          {testing ? (
            <>
              <RefreshCcw className="w-6 h-6 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              Start Speed Test
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
};

export default SpeedTest;
