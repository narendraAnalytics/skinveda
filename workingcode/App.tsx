
import React, { useEffect, useRef, useState } from 'react';
import VoiceAssistant from './components/VoiceAssistant';
import { GENDERS, HEALTH_CONDITIONS, SENSITIVITY_LEVELS, SKIN_CONCERNS, SKIN_TYPES } from './constants';
import { SkinAnalysisService } from './services/geminiService';
import { LANGUAGES, TRANSLATIONS } from './translations';
import { AnalysisResult, AppStep, HealthData, UserProfile } from './types';

const SkinVeda: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    gender: '',
    skinType: '',
    sensitivity: '',
    concerns: [],
    healthConditions: [],
    healthData: {
      steps: 0,
      sleepHours: 0,
      heartRate: 0,
      lastSync: ''
    },
    language: 'en'
  });
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const analysisService = new SkinAnalysisService();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Translation helper
  const t = (key: string) => TRANSLATIONS[profile.language]?.[key] || TRANSLATIONS.en[key] || key;

  // Auto-speak on step change
  useEffect(() => {
    const speakStep = async () => {
      let text = '';
      switch (step) {
        case AppStep.WELCOME: text = t('welcome'); break;
        case AppStep.PROFILE_NAME: text = t('name_q'); break;
        case AppStep.PROFILE_BIO: text = `${profile.name}, ${t('age_q')} ${t('gender_q')}`; break;
        case AppStep.SKIN_DETAILS: text = `${t('skin_type')} & ${t('sensitivity')}?`; break;
        case AppStep.CONCERNS_HEALTH: text = t('concerns_health'); break;
        case AppStep.PHOTO_CAPTURE: text = t('face_analysis'); break;
      }
      if (text) {
        const audioData = await analysisService.getTTS(text, profile.language);
        if (audioData) {
          const audio = new Audio(`data:audio/wav;base64,${audioData}`);
          audio.play();
        }
      }
    };
    speakStep();
  }, [step]);

  const handleNext = () => {
    if (step === AppStep.WELCOME) setStep(AppStep.PROFILE_NAME);
    else if (step === AppStep.PROFILE_NAME) setStep(AppStep.PROFILE_BIO);
    else if (step === AppStep.PROFILE_BIO) setStep(AppStep.SKIN_DETAILS);
    else if (step === AppStep.SKIN_DETAILS) setStep(AppStep.CONCERNS_HEALTH);
    else if (step === AppStep.CONCERNS_HEALTH) setStep(AppStep.PHOTO_CAPTURE);
  };

  const handleSyncHealthData = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockHealthData: HealthData = {
      steps: 8432,
      sleepHours: 6.5,
      heartRate: 72,
      lastSync: new Date().toISOString()
    };
    setProfile(prev => ({ ...prev, healthData: mockHealthData }));
    setIsSyncing(false);
  };

  const updateHealthField = (field: keyof HealthData, value: string) => {
    const numVal = parseFloat(value) || 0;
    setProfile(prev => ({
      ...prev,
      healthData: {
        ...prev.healthData!,
        [field]: numVal
      }
    }));
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setImage(dataUrl);
      stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
        };
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const runAnalysis = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    setStep(AppStep.ANALYSIS_LOADING);
    try {
      const base64 = image.split(',')[1];
      const result = await analysisService.analyzeSkin(profile, base64);
      setAnalysis(result);
      setStep(AppStep.RESULT);
    } catch (err) {
      console.error("Analysis failed:", err);
      setStep(AppStep.PHOTO_CAPTURE);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) setter(list.filter(i => i !== item));
    else setter([...list, item]);
  };

  const ProgressBar = ({ current }: { current: number }) => (
    <div className="w-full bg-emerald-100 h-2 rounded-full mb-8 overflow-hidden">
      <div
        className="bg-emerald-500 h-full transition-all duration-500"
        style={{ width: `${(current / 6) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[85vh] flex flex-col relative border-[8px] border-slate-900">

        {/* Status Bar Mock */}
        <div className="h-10 w-full flex justify-between items-center px-8 text-xs font-semibold text-slate-800">
          <span>9:41</span>
          <div className="flex gap-1.5">
            <i className="fas fa-signal"></i>
            <i className="fas fa-wifi"></i>
            <i className="fas fa-battery-full"></i>
          </div>
        </div>

        {/* Dynamic Voice Assistant */}
        <VoiceAssistant
          onTranscript={(text) => setVoiceTranscript(text)}
          currentQuestion={step}
          language={profile.language}
        />

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
          {step === AppStep.WELCOME && (
            <div className="text-center mt-8 space-y-6 animate-in fade-in duration-700">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                <i className="fas fa-leaf text-3xl text-emerald-600"></i>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('welcome')}</h1>
              <p className="text-slate-500 text-sm">{t('welcome_desc')}</p>

              <div className="space-y-3 pt-4">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{t('select_lang')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setProfile({ ...profile, language: l.id })}
                      className={`p-3 rounded-xl border-2 transition-all ${profile.language === l.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-50 bg-slate-50 text-slate-600'}`}
                    >
                      <span className="text-xs">{l.native}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all transform active:scale-95 mt-4"
              >
                {t('get_started')}
              </button>
            </div>
          )}

          {step === AppStep.PROFILE_NAME && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ProgressBar current={1} />
              <h2 className="text-2xl font-bold text-slate-900">{t('name_q')}</h2>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder={t('name_placeholder')}
                className="w-full border-b-2 border-emerald-100 py-4 text-xl outline-none focus:border-emerald-500 transition-all bg-transparent"
              />
              <button
                disabled={!profile.name}
                onClick={handleNext}
                className="w-full bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-md"
              >
                {t('continue')}
              </button>
            </div>
          )}

          {step === AppStep.PROFILE_BIO && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ProgressBar current={2} />
              <h2 className="text-2xl font-bold text-slate-900">{t('personal_details')}</h2>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-500">{t('age_q')}</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full border-2 border-slate-50 rounded-xl p-4 bg-slate-50 outline-none focus:border-emerald-200"
                />
              </div>
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-500">{t('gender_q')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {GENDERS.map(g => (
                    <button
                      key={g}
                      onClick={() => setProfile({ ...profile, gender: g })}
                      className={`p-4 rounded-xl text-xs border-2 transition-all ${profile.gender === g ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-50 bg-slate-50 text-slate-600'}`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!profile.age || !profile.gender}
                onClick={handleNext}
                className="w-full bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-md mt-8"
              >
                {t('next')}
              </button>
            </div>
          )}

          {step === AppStep.SKIN_DETAILS && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ProgressBar current={3} />
              <h2 className="text-2xl font-bold text-slate-900">{t('skin_profile')}</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-3">{t('skin_type')}</label>
                <div className="grid grid-cols-2 gap-3">
                  {SKIN_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => setProfile({ ...profile, skinType: type })}
                      className={`p-4 rounded-xl text-xs border-2 transition-all ${profile.skinType === type ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-100 bg-slate-50'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-3">{t('sensitivity')}</label>
                <div className="flex gap-2 flex-wrap">
                  {SENSITIVITY_LEVELS.map(s => (
                    <button
                      key={s}
                      onClick={() => setProfile({ ...profile, sensitivity: s })}
                      className={`px-6 py-3 rounded-full text-[10px] font-bold border-2 transition-all ${profile.sensitivity === s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-100'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <button
                disabled={!profile.skinType || !profile.sensitivity}
                onClick={handleNext}
                className="w-full bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-bold shadow-md mt-4"
              >
                {t('continue')}
              </button>
            </div>
          )}

          {step === AppStep.CONCERNS_HEALTH && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <ProgressBar current={4} />
              <h2 className="text-2xl font-bold text-slate-900">{t('concerns_health')}</h2>

              <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-watch-apple text-emerald-400 text-xl"></i>
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-50/70">{t('sync_health')}</p>
                  </div>
                  {profile.healthData?.lastSync && (
                    <span className="text-[10px] bg-emerald-500 text-white px-3 py-1 rounded-full font-bold animate-pulse">{t('synced')}</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] text-white/40 uppercase mb-1 font-bold">{t('steps')}</p>
                    <input
                      type="number"
                      value={profile.healthData?.steps}
                      onChange={(e) => updateHealthField('steps', e.target.value)}
                      className="bg-transparent text-white font-bold text-sm w-full outline-none focus:text-emerald-400"
                    />
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] text-white/40 uppercase mb-1 font-bold">{t('sleep')}</p>
                    <input
                      type="number"
                      step="0.1"
                      value={profile.healthData?.sleepHours}
                      onChange={(e) => updateHealthField('sleepHours', e.target.value)}
                      className="bg-transparent text-white font-bold text-sm w-full outline-none focus:text-emerald-400"
                    />
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[9px] text-white/40 uppercase mb-1 font-bold">{t('bpm')}</p>
                    <input
                      type="number"
                      value={profile.healthData?.heartRate}
                      onChange={(e) => updateHealthField('heartRate', e.target.value)}
                      className="bg-transparent text-white font-bold text-sm w-full outline-none focus:text-emerald-400"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSyncHealthData}
                  disabled={isSyncing}
                  className="w-full bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-600/30 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  {isSyncing ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-sync"></i>}
                  {isSyncing ? t('syncing') : t('sync_btn')}
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-3">{t('main_concerns')}</label>
                <div className="flex flex-wrap gap-2">
                  {SKIN_CONCERNS.map(c => (
                    <button
                      key={c}
                      onClick={() => toggleItem(profile.concerns, c, (v) => setProfile({ ...profile, concerns: v }))}
                      className={`px-4 py-2 rounded-full text-[10px] border transition-all ${profile.concerns.includes(c) ? 'bg-emerald-100 text-emerald-700 border-emerald-200 font-medium' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-3">{t('lifestyle')}</label>
                <div className="flex flex-wrap gap-2">
                  {HEALTH_CONDITIONS.map(h => (
                    <button
                      key={h}
                      onClick={() => toggleItem(profile.healthConditions, h, (v) => setProfile({ ...profile, healthConditions: v }))}
                      className={`px-4 py-2 rounded-full text-[10px] border transition-all ${profile.healthConditions.includes(h) ? 'bg-rose-50 text-rose-700 border-rose-100 font-medium' : 'bg-slate-50 text-slate-500 border-slate-100'}`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handleNext}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-md mt-4"
              >
                {t('final_step')}
              </button>
            </div>
          )}

          {step === AppStep.PHOTO_CAPTURE && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 flex flex-col items-center">
              <ProgressBar current={5} />
              <h2 className="text-2xl font-bold text-slate-900 text-center">{t('face_analysis')}</h2>

              <div className="relative w-full aspect-[4/5] bg-slate-900 rounded-[2rem] overflow-hidden shadow-inner border-2 border-slate-100">
                {image ? (
                  <img src={image} className="w-full h-full object-cover" />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}

                {isCameraActive && !image && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-4/5 h-4/5 border-2 border-dashed border-white/40 rounded-[5rem] flex items-center justify-center relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/30 blur-sm animate-[scan_2s_infinite]"></div>
                    </div>
                  </div>
                )}

                {!image && !isCameraActive && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-900/60 backdrop-blur-[4px] transition-all duration-300">
                    <button onClick={startCamera} className="bg-white text-slate-900 px-10 py-5 rounded-full font-bold shadow-2xl transition-all flex items-center gap-3">
                      <i className="fas fa-camera text-emerald-600 text-xl"></i>
                      <span>{t('capture')}</span>
                    </button>
                  </div>
                )}

                {image && (
                  <button onClick={() => { setImage(null); setIsCameraActive(false); }} className="absolute top-6 right-6 bg-rose-500/80 backdrop-blur-md p-3 rounded-full text-white shadow-lg">
                    <i className="fas fa-trash-alt"></i>
                  </button>
                )}
              </div>

              {isCameraActive && !image && (
                <button onClick={handleCapture} className="w-20 h-20 rounded-full border-[6px] border-emerald-600/30 p-1 flex items-center justify-center shadow-xl active:scale-90">
                  <div className="w-full h-full rounded-full bg-emerald-600 flex items-center justify-center shadow-inner">
                    <i className="fas fa-camera text-white text-xl"></i>
                  </div>
                </button>
              )}

              {image && (
                <button onClick={runAnalysis} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center justify-center gap-3">
                  <i className="fas fa-sparkles"></i>
                  {t('analyze')}
                </button>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {step === AppStep.ANALYSIS_LOADING && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-20">
              <div className="relative">
                <div className="w-32 h-32 border-4 border-emerald-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-32 h-32 border-t-4 border-emerald-600 rounded-full animate-spin"></div>
                <i className="fas fa-wand-magic-sparkles absolute inset-0 flex items-center justify-center text-3xl text-emerald-600"></i>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">{t('reading_skin')}</h3>
                <p className="text-slate-500 animate-bounce">{t('scanning')}</p>
              </div>
            </div>
          )}

          {step === AppStep.RESULT && analysis && (
            <div className="space-y-8 animate-in zoom-in duration-500 pb-12">
              <div className="text-center">
                <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">{t('findings')}</p>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{profile.name}'s Report</h2>
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="w-28 h-28 rounded-full border-4 border-emerald-500 p-1 shadow-2xl">
                  <img src={image || 'https://picsum.photos/200'} className="w-full h-full rounded-full object-cover" />
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-tighter">{t('vitality')}</p>
                  <h3 className="text-6xl font-black text-emerald-600">{analysis.overallScore}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-slate-100 p-4 rounded-3xl text-center shadow-sm">
                  <p className="text-slate-400 text-[9px] font-black uppercase mb-1">{t('eye_age')}</p>
                  <p className="text-2xl font-black text-slate-800">{analysis.eyeAge}</p>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-3xl text-center shadow-sm">
                  <p className="text-slate-400 text-[9px] font-black uppercase mb-1">{t('skin_age')}</p>
                  <p className="text-2xl font-black text-slate-800">{analysis.skinAge}</p>
                </div>
              </div>

              <div className="space-y-5 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <i className="fas fa-microscope text-emerald-500"></i>
                  {t('clinical')}
                </h4>
                {[
                  { label: 'Hydration', val: analysis.hydration, color: 'bg-blue-500' },
                  { label: 'Redness', val: analysis.redness, color: 'bg-red-400' },
                  { label: 'Pigmentation', val: analysis.pigmentation, color: 'bg-amber-400' },
                  { label: 'Acne', val: analysis.acne, color: 'bg-emerald-400' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>{item.label}</span>
                      <span>{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`${item.color} h-full transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 italic text-emerald-900 text-xs leading-relaxed">
                {analysis.summary}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-3 px-2">
                  <i className="fas fa-notes-medical text-rose-500"></i>
                  {t('prescription')}
                </h3>

                <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-6">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fas fa-apple-whole text-orange-600"></i>
                    {t('diet_guide')}
                  </h4>
                  <div className="bg-orange-50/50 p-4 rounded-2xl">
                    <p className="text-[9px] font-black uppercase text-orange-700 mb-2">{t('juices')}</p>
                    <ul className="text-xs space-y-2 text-slate-700">
                      {analysis.recommendations.diet.juices.map((j, i) => (
                        <li key={i} className="flex gap-2"> {j}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-emerald-900 text-white p-8 rounded-[2rem] space-y-8 relative overflow-hidden">
                  <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
                    <i className="fas fa-om"></i> {t('vedic_ritual')}
                  </h3>
                  <div className="space-y-6 relative z-10">
                    <div className="space-y-4">
                      <h4 className="font-black text-emerald-400 uppercase text-[9px]">{t('yoga')}</h4>
                      <ul className="space-y-3 text-xs text-emerald-50/80">
                        {analysis.recommendations.yoga.map((y, i) => (
                          <li key={i} className="flex gap-3"><i className="fas fa-circle-check text-emerald-400"></i> {y}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(AppStep.WELCOME)}
                className="w-full border-2 border-slate-200 text-slate-500 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest"
              >
                {t('restart')}
              </button>
            </div>
          )}
        </div>

        {/* Tab Bar Mock */}
        <div className="h-20 w-full border-t border-slate-100 flex items-center justify-around px-8 bg-white/95 backdrop-blur-md">
          <button className="flex flex-col items-center gap-1 text-emerald-600">
            <i className="fas fa-home text-lg"></i>
            <span className="text-[9px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-300">
            <i className="fas fa-spa text-lg"></i>
            <span className="text-[9px] font-bold">Yoga</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-300">
            <i className="fas fa-chart-line text-lg"></i>
            <span className="text-[9px] font-bold">Trends</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-300">
            <i className="fas fa-user text-lg"></i>
            <span className="text-[9px] font-bold">Profile</span>
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(400%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SkinVeda;
