import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VideoHub from './pages/VideoHub';
import AnalyzeFarm from './pages/AnalyzeFarm';
import Marketplace from './pages/Marketplace';
import SchemesPage from './pages/SchemesPage';

import SmartDevice from './pages/SmartDevice';
import LandingPage from './pages/LandingPage';
import Diagnostics from './pages/Diagnostics';

function App() {
    const [currentLang, setCurrentLang] = useState('hi-IN');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
                <Route path="/home" element={<HomePage currentLang={currentLang} setCurrentLang={setCurrentLang} />} />
                <Route path="/videos" element={<VideoHub language={currentLang} />} />
                <Route path="/analyze" element={<AnalyzeFarm language={currentLang} />} />
                <Route path="/market" element={<Marketplace language={currentLang} />} />
                <Route path="/schemes" element={<SchemesPage language={currentLang} />} />
                <Route path="/diagnostics" element={<Diagnostics />} />
                <Route path="/smart-device" element={<SmartDevice />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
