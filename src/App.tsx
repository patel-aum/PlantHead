import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthLayout from './layouts/AuthLayout';
import RootLayout from './layouts/RootLayout';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import MyPlants from './pages/MyPlants';
import Profile from './pages/Profile';
import PlantWiki from './pages/PlantWiki';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
        </Route>
        
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/my-plants" element={<MyPlants />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wiki" element={<PlantWiki />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;