'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const ASSETS = {
  leavesGlb: '/models/leaves.glb',
  cherryGlb: '/models/cherry.glb',
  blueberryGlb: '/models/blueberry.glb',
  canGlb: '/models/deit_soda2.glb',
  greenSodaPng: '/images/green_soda.png',
  blueSodaPng: '/images/blue_soda.png',
  greenBaseJpg: '/images/green_base_color.jpg',
  blueBaseJpg: '/images/blue_base_color.jpg',
  bubblePng: '/images/bubble.png',
};

const FAQ_ITEMS = [
  {
    q: 'Is POP:ZERO truly zero sugar and zero calorie?',
    a: 'Yes. POP:ZERO contains 0g added sugar, 0g artificial sweeteners, and under 5 natural calories derived solely from cold-pressed fruit botanicals.',
  },
  {
    q: 'How does POP:ZERO taste so crisp without artificial chemicals?',
    a: 'We use high-elevation botanical infusions, organic fruit essences, and micro-carbonation to deliver a sharp, clean bite without the cloying chemical aftertaste of standard diet sodas.',
  },
  {
    q: 'What is inside the prebiotic blend?',
    a: 'Each can is packed with plant-based prebiotic fiber from organic chicory root and green tea polyphenols to support balanced gut flora and natural digestional wellness.',
  },
  {
    q: 'Are your cans BPA-free and sustainable?',
    a: '100%. Our sleek cans are made with ultra-light, BPA-free lined aerospace-grade aluminum that is infinitely recyclable without degradation.',
  },
];

export default function Home() {
  const [activeFlavor, setActiveFlavor] = useState('classic');
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const isSwitchingRef = useRef(false);
  const switchSpinRef = useRef(0);
  const blueTextureRef = useRef(null);
  const greenTextureRef = useRef(null);
  const modelViewerRef = useRef(null);

  const handleSwitchFlavor = (flavor) => {
    if (isSwitchingRef.current) return;
    setActiveFlavor(flavor);
    switchFlavorAnimation(flavor);
  };

  const handleNavArrow = (direction) => {
    if (isSwitchingRef.current) return;
    const nextFlavor = activeFlavor === 'classic' ? 'blue' : 'classic';
    handleSwitchFlavor(nextFlavor);
  };

  const switchFlavorAnimation = (flavor) => {
    if (isSwitchingRef.current) return;
    isSwitchingRef.current = true;

    const body = document.body;
    const modelViewer = modelViewerRef.current;
    const berries = document.querySelectorAll('.berry');
    const heroCenter = document.querySelector('.hero-center');

    // 1. Background Animation
    const targetColors =
      flavor === 'blue'
        ? { inner: '#0b4f8a', mid: '#04294e', outer: '#010c14' }
        : { inner: '#0b8a78', mid: '#044e3b', outer: '#011411' };

    gsap.to(body, {
      '--bg-inner': targetColors.inner,
      '--bg-mid': targetColors.mid,
      '--bg-outer': targetColors.outer,
      duration: 1.5,
      ease: 'power2.inOut',
    });

    // 2. Can Spin Animation
    const spinObj = { val: 0, blur: 0 };
    gsap.to(spinObj, {
      val: 360,
      blur: 15,
      duration: 0.6,
      ease: 'power2.in',
      onUpdate: () => {
        switchSpinRef.current = spinObj.val;
        if (modelViewer) {
          modelViewer.style.filter = `blur(${spinObj.blur}px)`;
        }
      },
      onComplete: async () => {
        if (flavor === 'blue') {
          body.classList.add('blue-theme');
          if (modelViewer?.model && blueTextureRef.current) {
            modelViewer.model.materials.forEach((material) => {
              if (material.pbrMetallicRoughness.baseColorTexture) {
                material.pbrMetallicRoughness.baseColorTexture.setTexture(blueTextureRef.current);
              }
            });
          }
        } else {
          body.classList.remove('blue-theme');
          if (modelViewer?.model && greenTextureRef.current) {
            modelViewer.model.materials.forEach((material) => {
              if (material.pbrMetallicRoughness.baseColorTexture) {
                material.pbrMetallicRoughness.baseColorTexture.setTexture(greenTextureRef.current);
              }
            });
          }
        }

        gsap.to(spinObj, {
          val: 720,
          blur: 0,
          duration: 1.5,
          ease: 'back.out(0.7)',
          onUpdate: () => {
            switchSpinRef.current = spinObj.val;
            if (modelViewer) {
              modelViewer.style.filter = `blur(${spinObj.blur}px)`;
            }
          },
          onComplete: () => {
            switchSpinRef.current = 0;
            if (modelViewer) {
              modelViewer.style.filter = 'none';
            }
          },
        });
      },
    });

    // 3. Berries "Hide & Reveal" with Dynamic Positioning
    let completedBerries = 0;
    berries.forEach((berry) => {
      const bW = berry.offsetWidth / 2;
      const bH = berry.offsetHeight / 2;
      const centerX = window.innerWidth / 2 - berry.offsetLeft - bW;
      const centerY = window.innerHeight / 2 - berry.offsetTop - bH;

      const startAngle = parseFloat(berry.dataset.angle) || 0;
      const currentBaseX = parseFloat(berry.dataset.baseX) || 0;
      const currentBaseY = parseFloat(berry.dataset.baseY) || 0;

      const nextBaseX = (Math.random() - 0.5) * 200;
      const nextBaseY = (Math.random() - 0.5) * 200;

      gsap.set(berry, {
        rotation: startAngle,
        x: currentBaseX,
        y: currentBaseY,
      });

      const berryTl = gsap.timeline();

      berryTl
        .to(berry, {
          x: centerX,
          y: centerY,
          rotation: startAngle + 45,
          scale: 0.1,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
          onComplete: () => {
            berry.src = flavor === 'blue' ? ASSETS.blueberryGlb : ASSETS.cherryGlb;
            if (heroCenter) heroCenter.style.zIndex = 50;
          },
        })
        .to(berry, {
          duration: 0.3,
        })
        .to(berry, {
          onStart: () => {
            if (heroCenter) heroCenter.style.zIndex = 1;
          },
          x: nextBaseX,
          y: nextBaseY,
          rotation: startAngle + 90,
          scale: 1,
          opacity: 1,
          duration: 0.9,
          ease: 'back.out(1.5)',
          onComplete: () => {
            berry.dataset.angle = startAngle + 90;
            berry.dataset.baseX = nextBaseX;
            berry.dataset.baseY = nextBaseY;
            berry.dataset.rx = 0;
            berry.dataset.ry = 0;

            completedBerries++;
            if (completedBerries === berries.length) {
              isSwitchingRef.current = false;
            }
          },
        });
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const modelViewer = modelViewerRef.current;
    const berriesFG = document.querySelector('.berries-container');
    const berriesBG = document.querySelector('.berries-container-bg');
    const leavesBG = document.querySelector('.leaves-container');
    const allBerries = document.querySelectorAll('.berry');

    const handleModelLoad = async () => {
      try {
        if (!modelViewer) return;
        blueTextureRef.current = await modelViewer.createTexture(ASSETS.blueBaseJpg);
        greenTextureRef.current = await modelViewer.createTexture(ASSETS.greenBaseJpg);

        if (modelViewer.model) {
          const material = modelViewer.model.materials[0];
          if (material && material.pbrMetallicRoughness.baseColorTexture) {
            material.pbrMetallicRoughness.baseColorTexture.setTexture(blueTextureRef.current);
            await new Promise((r) => requestAnimationFrame(r));
            material.pbrMetallicRoughness.baseColorTexture.setTexture(greenTextureRef.current);
          }
        }
      } catch (e) {
        console.error('Texture preload failed', e);
      }
    };

    if (modelViewer) {
      modelViewer.addEventListener('load', handleModelLoad);
    }

    allBerries.forEach((b) => {
      b.dataset.rx = 0;
      b.dataset.ry = 0;
      b.dataset.angle = Math.random() * 360;
      b.dataset.baseX = 0;
      b.dataset.baseY = 0;
      b.dataset.targetRx = 0;
      b.dataset.targetRy = 0;
    });

    const mouse = { x: 0, y: 0, px: 0, py: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
      mouse.px = e.clientX;
      mouse.py = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    function animate() {
      const time = Date.now() * 0.001;

      currentMouse.x += (mouse.x - currentMouse.x) * 0.05;
      currentMouse.y += (mouse.y - currentMouse.y) * 0.05;

      if (modelViewer) {
        modelViewer.cameraOrbit = `${currentMouse.x * 40 + switchSpinRef.current}deg ${
          90 + currentMouse.y * 20
        }deg 380%`;
      }

      if (berriesFG) berriesFG.style.transform = `translate(${currentMouse.x * 60}px, ${currentMouse.y * 60}px)`;
      if (berriesBG) berriesBG.style.transform = `translate(${currentMouse.x * -30}px, ${currentMouse.y * -30}px)`;
      if (leavesBG) leavesBG.style.transform = `translate(${currentMouse.x * -15}px, ${currentMouse.y * -15}px)`;

      if (!isSwitchingRef.current) {
        allBerries.forEach((berry, i) => {
          const berryRect = berry.getBoundingClientRect();
          const berryX = berryRect.left + berryRect.width / 2;
          const berryY = berryRect.top + berryRect.height / 2;

          const diffX = mouse.px - berryX;
          const diffY = mouse.py - berryY;
          const distance = Math.sqrt(diffX * diffX + diffY * diffY);

          let targetRx = 0,
            targetRy = 0,
            speedMult = 1;

          if (distance < 400) {
            const force = (400 - distance) / 400;
            targetRx = (diffX / distance) * force * -80;
            targetRy = (diffY / distance) * force * -80;
            speedMult = 1 + force * 5;
          }

          let rx = parseFloat(berry.dataset.rx) || 0;
          let ry = parseFloat(berry.dataset.ry) || 0;
          let angle = parseFloat(berry.dataset.angle) || 0;
          let baseX = parseFloat(berry.dataset.baseX) || 0;
          let baseY = parseFloat(berry.dataset.baseY) || 0;

          rx += (targetRx - rx) * 0.1;
          ry += (targetRy - ry) * 0.1;
          angle += 0.2 * speedMult;

          berry.dataset.rx = rx;
          berry.dataset.ry = ry;
          berry.dataset.angle = angle;

          const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9];
          const phase = (time + i * 0.7) * ((Math.PI * 2) / dur);
          const floatY = Math.sin(phase) * 15;
          const floatAngle = Math.cos(phase) * 6;

          berry.style.transform = `translate(calc(${rx + baseX}px), calc(${ry + baseY}px + ${floatY}px)) rotate(calc(${angle}deg + ${floatAngle}deg))`;
        });
      }

      document.querySelectorAll('.leaf').forEach((leaf, i) => {
        const dur = 10 + i * 2;
        const phase = (time + i * 1.2) * ((Math.PI * 2) / dur);
        const floatY = Math.sin(phase) * 20;
        const floatX = Math.cos(phase * 0.5) * 15;
        const floatAngle = Math.sin(phase * 0.3) * 15;
        leaf.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${floatAngle}deg)`;
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    const bubblesContainer = document.getElementById('bubbles-container');
    const bubbleInterval = setInterval(() => {
      if (!bubblesContainer) return;
      const bubble = document.createElement('img');
      bubble.src = ASSETS.bubblePng;
      bubble.className = 'bubble-img';
      const size = Math.random() * 20 + 10 + 'px';
      bubble.style.width = size;
      bubble.style.height = 'auto';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.bottom = '-50px';
      bubble.style.opacity = Math.random() * 0.4 + 0.2;

      const duration = Math.random() * 6 + 4;
      bubble.style.animation = `floatUpImg ${duration}s linear forwards`;

      bubblesContainer.appendChild(bubble);
      setTimeout(() => bubble.remove(), duration * 1000);
    }, 400);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      const progressBar = document.getElementById('scroll-progress-bar');
      if (progressBar) progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      if (modelViewer) {
        modelViewer.removeEventListener('load', handleModelLoad);
      }
      cancelAnimationFrame(animationFrameId);
      clearInterval(bubbleInterval);
    };
  }, [mounted]);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    setEmailSubmitted(true);
    setTimeout(() => setEmailSubmitted(false), 5000);
  };

  return (
    <>
      {/* Top Scroll Progress Bar */}
      <div id="scroll-progress-bar"></div>

      {/* 1. Bubbles container */}
      <div id="bubbles-container"></div>

      {/* 2. Header (Glass Nav) with custom POP:ZERO logo */}
      <header className="header">
        <a href="#" className="logo" aria-label="POP:ZERO Homepage">
          <div className="brand-icon">
            <svg width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="18" cy="18" r="11" stroke="#fbcfe8" strokeWidth="2.5" />
              <path d="M13 11L23 25" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3.5" fill="currentColor" />
            </svg>
          </div>
          <span className="brand-title">
            POP<span className="brand-colon">:</span><span className="brand-zero">ZERO</span>
          </span>
        </a>

        <nav className="nav glass">
          <a href="#" className="nav-item active">Home</a>
          <a href="#ingredients" className="nav-item">Ingredients</a>
          <a href="#taste" className="nav-item">Taste</a>
          <a href="#eco" className="nav-item">Eco</a>
          <a href="#reviews" className="nav-item">Reviews</a>
          <a href="#faq" className="nav-item">FAQ</a>
        </nav>

        <a href="#drop" className="contact-btn">
          Pre-Order
        </a>
      </header>

      {/* 3. Hero section */}
      <main className="hero">
        <div className="hero-content">
          {/* 3a. Floating leaves (far background) */}
          <div className="leaves-container">
            {mounted && (
              <>
                <model-viewer
                  class="leaf l1"
                  src={ASSETS.leavesGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="45deg 75deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="leaf l2"
                  src={ASSETS.leavesGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="-30deg 60deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="leaf l3"
                  src={ASSETS.leavesGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="120deg 85deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="leaf l4"
                  src={ASSETS.leavesGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="10deg 45deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
              </>
            )}
          </div>

          {/* 3b. Left column */}
          <div className="hero-left">
            <div className="brand-badge-pill">
              <span>✦</span> Next-Gen Beverage
            </div>
            <h1 className="main-title large-animation-1">
              <span className="outline">Pure</span>
              <br />
              Zero
            </h1>
            <p className="description">
              Unleash the crisp taste of zero sugar. <br />
              <strong>POP:ZERO</strong> redefines refreshment in every micro-bubble — botanical
              spark in one sleek design.
            </p>
            <div className="cta-group">
              <a href="#drop" className="primary-btn">
                Shop Now
                <span className="plus-icon">+</span>
              </a>
              <a href="#taste" className="secondary-btn">
                Explore Flavors ↓
              </a>
            </div>
            <div className="award-badge">
              <div className="award-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 15L15 18L19 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="award-text">
                <span className="award-title">DESIGN AWARDS</span>
                <span className="award-subtitle">POP:ZERO BOTANICAL 2025</span>
              </div>
            </div>
          </div>

          {/* 3c. Background berries (behind the can) */}
          <div className="berries-container-bg">
            {mounted && (
              <>
                <model-viewer
                  class="berry b7"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="-20deg 110deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b8"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="160deg 45deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b9"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.0"
                  interaction-prompt="none"
                  camera-orbit="45deg 20deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
              </>
            )}
          </div>

          {/* 3d. Center product (the 3D can) */}
          <div className="hero-center">
            {mounted && (
              <model-viewer
                ref={modelViewerRef}
                id="product-model"
                src={ASSETS.canGlb}
                alt="POP:ZERO 3D Can Model"
                camera-controls
                disable-zoom
                shadow-intensity="0"
                environment-image="neutral"
                exposure="1.5"
                interaction-prompt="none"
                camera-orbit="0deg 90deg 380%"
                field-of-view="30deg"
                class="main-product-3d"
                suppressHydrationWarning
              ></model-viewer>
            )}
          </div>

          {/* 3e. Foreground berries (above text and can) */}
          <div className="berries-container">
            {mounted && (
              <>
                <model-viewer
                  class="berry b1"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="45deg 120deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b2"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="-120deg 45deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b3"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="200deg 90deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b4"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="10deg 20deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b5"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="-45deg 160deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
                <model-viewer
                  class="berry b6"
                  src={ASSETS.cherryGlb}
                  environment-image="neutral"
                  exposure="1.2"
                  interaction-prompt="none"
                  camera-orbit="80deg 75deg 105%"
                  suppressHydrationWarning
                ></model-viewer>
              </>
            )}
          </div>

          {/* 3f. Right column (flavor carousel + side title) */}
          <div className="hero-right">
            <div className="product-carousel">
              <div className="carousel-cards">
                <div
                  className={`card ${activeFlavor === 'classic' ? 'active' : ''}`}
                  data-flavor="classic"
                  onClick={() => handleSwitchFlavor('classic')}
                >
                  <img src={ASSETS.greenSodaPng} alt="POP:ZERO Emerald Lime" />
                  <div className="card-info">
                    <span>Emerald Lime</span>
                    <span>$2.99</span>
                  </div>
                </div>
                <div
                  className={`card ${activeFlavor === 'blue' ? 'active' : ''}`}
                  data-flavor="blue"
                  onClick={() => handleSwitchFlavor('blue')}
                >
                  <img src={ASSETS.blueSodaPng} alt="POP:ZERO Electric Berry" style={{ filter: 'brightness(0.7)' }} />
                  <div className="card-info">
                    <span>Electric Berry</span>
                    <span>$2.99</span>
                  </div>
                </div>
              </div>
              <div className="carousel-nav">
                <button className="nav-arrow" aria-label="Previous Flavor" onClick={() => handleNavArrow('prev')}>
                  ←
                </button>
                <button className="nav-arrow" aria-label="Next Flavor" onClick={() => handleNavArrow('next')}>
                  →
                </button>
              </div>
            </div>
            <h2 className="side-title large-animation-1">
              <span className="outline">Refreshingly</span>
              <br />
              Clean
            </h2>
          </div>
        </div>
      </main>

      {/* Model preload on client to prevent lag during flavor switch */}
      {mounted && (
        <div style={{ display: 'none' }}>
          <model-viewer src={ASSETS.blueberryGlb} suppressHydrationWarning></model-viewer>
          <model-viewer src={ASSETS.cherryGlb} suppressHydrationWarning></model-viewer>
        </div>
      )}

      {/* 4. Section: Ingredients & Super-Botanicals */}
      <section id="ingredients" className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Super-Botanicals</div>
            <h2 className="section-heading">Formulated for Pure Vitality</h2>
            <p className="section-subtext">
              Zero compromises on taste. Every can of <strong>POP:ZERO</strong> is infused with
              adaptogenic herbs, prebiotics, and natural plant extracts.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M4.93 4.93l14.14 14.14" />
                </svg>
              </div>
              <h3 className="feature-title">0g Sugar & Aspartame</h3>
              <p className="feature-desc">
                No blood sugar spikes, zero keto penalties, and none of the chemical aftertaste of
                traditional diet sodas.
              </p>
              <span className="feature-pill">Pure Sweetness</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="feature-title">Active Prebiotics</h3>
              <p className="feature-desc">
                Infused with organic chicory root fiber that feeds beneficial microbiome bacteria for
                natural daily digestive vitality.
              </p>
              <span className="feature-pill">Gut-Biome Fuel</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Micro-Carbonation</h3>
              <p className="feature-desc">
                Tightly calibrated micro-bubbles create an ultra-smooth velvety champagne fizz that stays
                crisp down to the final drop.
              </p>
              <span className="feature-pill">Velvet Fizz</span>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h3 className="feature-title">Natural Electrolytes</h3>
              <p className="feature-desc">
                Ionic magnesium and potassium from pink Himalayan salts for clean, natural hydration without
                crash or bloating.
              </p>
              <span className="feature-pill">Peak Hydration</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section: Taste Lab / Flavor Spectrum */}
      <section id="taste" className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Flavor Lab</div>
            <h2 className="section-heading">Two Worlds. Pure Zero.</h2>
            <p className="section-subtext">
              Switch between our signature flavors using the hero carousel above or explore their taste
              profiles below.
            </p>
          </div>

          <div className="taste-showcase">
            <div className={`flavor-box ${activeFlavor === 'classic' ? 'active-flavor' : ''}`}>
              <div className="flavor-header">
                <span className="flavor-num">FLAVOR 01 // TEAL</span>
                <span className="flavor-tag">Botanical Classic</span>
              </div>
              <h3 className="flavor-name">Emerald Lime</h3>
              <p className="flavor-profile">
                Crisp Persian lime zest harmonized with fresh spearmint leaves and mountain juniper. Clean,
                astringent, and deeply thirst-quenching.
              </p>

              <div className="metric-bar-group">
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Crisp Carbonation</span>
                    <span>95%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '95%' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Citrus Zest</span>
                    <span>90%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Herbaceous Finish</span>
                    <span>75%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flavor-box ${activeFlavor === 'blue' ? 'active-flavor' : ''}`}>
              <div className="flavor-header">
                <span className="flavor-num">FLAVOR 02 // COBALT</span>
                <span className="flavor-tag">Berry Infusion</span>
              </div>
              <h3 className="flavor-name">Electric Berry</h3>
              <p className="flavor-profile">
                Wild arctic blueberries mashed with ripe black cherries and lavender blossom. Velvety, rich,
                and subtly sweet without a trace of sugar.
              </p>

              <div className="metric-bar-group">
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Berry Fruitiness</span>
                    <span>96%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Tartness Balance</span>
                    <span>82%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label-row">
                    <span>Velvet Body</span>
                    <span>88%</span>
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section: Eco & Sustainability */}
      <section id="eco" className="section">
        <div className="section-container">
          <div className="eco-banner">
            <div>
              <div className="section-badge">Planet Stewardship</div>
              <h2 className="section-heading" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Infinite Aluminum. Zero Plastic.
              </h2>
              <p className="section-subtext" style={{ marginBottom: '2rem' }}>
                Every single can of <strong>POP:ZERO</strong> is produced in a closed-loop renewable
                powered facility. Aluminum is recycled forever, turning back into cans within 60 days.
              </p>
              <a href="#drop" className="primary-btn" style={{ padding: '0.75rem 1.8rem' }}>
                Join the Mission →
              </a>
            </div>

            <div className="eco-stats">
              <div className="stat-item">
                <div className="stat-val">100%</div>
                <div className="stat-desc">Recyclable Metal</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">0g</div>
                <div className="stat-desc">Single-Use Plastic</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">60 Days</div>
                <div className="stat-desc">Closed-Loop Cycle</div>
              </div>
              <div className="stat-item">
                <div className="stat-val">1%</div>
                <div className="stat-desc">To Ocean Cleanups</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section: Reviews & Press */}
      <section id="reviews" className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">Accolades</div>
            <h2 className="section-heading">Loved by Sippers & Critics</h2>
            <p className="section-subtext">Over 15,000 cases shipped nationwide with a 4.9-star rating.</p>
          </div>

          <div className="press-row">
            <span className="press-item">GQ</span>
            <span className="press-item">Wired</span>
            <span className="press-item">Bon Appétit</span>
            <span className="press-item">Esquire</span>
            <span className="press-item">Fast Company</span>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-quote">
                &ldquo;POP:ZERO completely replaced my afternoon soda habit. The Emerald Lime has this real,
                sharp bite that tastes like a craft cocktail.&rdquo;
              </p>
              <div className="review-author">
                <span className="author-name">Marcus Vance</span>
                <span className="verified-badge">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-quote">
                &ldquo;The 3D design of the can drew me in, but the taste kept me hooked. Electric Berry is
                phenomenal chilled over ice.&rdquo;
              </p>
              <div className="review-author">
                <span className="author-name">Elena Rostova</span>
                <span className="verified-badge">✓ Verified Buyer</span>
              </div>
            </div>

            <div className="review-card">
              <div className="stars">★★★★★</div>
              <p className="review-quote">
                &ldquo;Clean prebiotics, no stevia bitterness, and gorgeous packaging. This is the future of
                functional drinks.&rdquo;
              </p>
              <div className="review-author">
                <span className="author-name">Julian K.</span>
                <span className="verified-badge">✓ Verified Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section: FAQ Accordion */}
      <section id="faq" className="section">
        <div className="section-container">
          <div className="section-header">
            <div className="section-badge">FAQ</div>
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <p className="section-subtext">Everything you need to know about ingredients, shipping, and cans.</p>
          </div>

          <div className="faq-list">
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  aria-expanded={openFaq === idx}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon" style={{ transform: openFaq === idx ? 'rotate(45deg)' : 'none' }}>
                    +
                  </span>
                </button>
                {openFaq === idx && <div className="faq-answer">{item.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. VIP Drop Alert Newsletter */}
      <section id="drop" className="cta-banner-section">
        <div className="cta-banner-card">
          <div className="section-badge">Limited Batch</div>
          <h2 className="section-heading" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            Get First Sip of Batch 04
          </h2>
          <p className="section-subtext" style={{ maxWidth: '520px', margin: '0 auto' }}>
            Enter your email to receive private drop alerts, limited-edition merch, and 15% off your first 12-pack.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              {emailSubmitted ? 'You’re on the list! ✓' : 'Join Drop List'}
            </button>
          </form>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="#" className="logo">
                <div className="brand-icon">
                  <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="14" stroke="#fbcfe8" strokeWidth="2.5" />
                    <path d="M13 11L23 25" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="18" cy="18" r="3.5" fill="#fbcfe8" />
                  </svg>
                </div>
                <span className="brand-title">
                  POP<span className="brand-colon">:</span><span className="brand-zero">ZERO</span>
                </span>
              </a>
              <p>
                The new standard for clean carbonation. Real botanicals, active prebiotics, and zero sugar.
                Crafted in California.
              </p>
            </div>

            <div className="footer-col">
              <h4>Flavors</h4>
              <ul>
                <li>
                  <a href="#taste" onClick={() => handleSwitchFlavor('classic')}>
                    Emerald Lime (01)
                  </a>
                </li>
                <li>
                  <a href="#taste" onClick={() => handleSwitchFlavor('blue')}>
                    Electric Berry (02)
                  </a>
                </li>
                <li><a href="#drop">Variety Pack</a></li>
                <li><a href="#drop">Limited Reserves</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>About</h4>
              <ul>
                <li><a href="#ingredients">Ingredients</a></li>
                <li><a href="#eco">Sustainability</a></li>
                <li><a href="#reviews">Press & Awards</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Connect</h4>
              <ul>
                <li><a href="mailto:hello@popzero.drink">hello@popzero.drink</a></li>
                <li><a href="#drop">Wholesale Inquiries</a></li>
                <li><a href="#">Store Locator</a></li>
                <li><a href="#">Stockists</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} POP:ZERO Beverages Inc. All rights reserved. Zero sugar, zero compromise.</span>
            <div className="footer-socials">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="X (formerly Twitter)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="TikTok">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.53a6.38 6.38 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.17a8.16 8.16 0 0 0 4.91 1.63v-3.5a4.78 4.78 0 0 1-1-.61z" />
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
