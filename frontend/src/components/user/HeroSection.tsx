import { Carousel,   } from "@material-tailwind/react";
import { motion } from 'framer-motion';
import HeroBanner from "./HeroBanner";
import { useNavigate } from "react-router-dom";
import { showToastMessage } from "../../validations/common/toast";
import { USER } from "../../config/constants/constants";
import React, { useCallback, useEffect, useState } from 'react';
import { VendorData } from '../../types/vendorTypes';
import { CATEGORIES, services } from "@/utils/utils";
import { CarouselArrowProps,CarouselNavigationProps } from "@/utils/interface";
import { getVendors } from "@/services/userAuthService";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
const CAROUSEL_IMAGES = [
  '/images/caro1.jpg',
  '/images/caro2.jpg',
  '/images/caro3.jpg',
];


const HeroSection = () => {
  const [vendors, setVendors] = useState<VendorData[]>([])

 const fetchData = useCallback(async () => {
  try {
    const vendors = await getVendors(5);

    const sortedVendors = vendors.sort(
      (a, b) => (b.totalRating ?? 0) - (a.totalRating ?? 0)
    );

    setVendors(sortedVendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
  }
}, []);



  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const navigate = useNavigate()

  const CarouselNavigation = useCallback(({ setActiveIndex, activeIndex, length }: CarouselNavigationProps) => (
    <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
      {Array.from({ length }).map((_, i) => (
        <span
          key={i}
          className={`block h-3 w-3 cursor-pointer rounded-full transition-colors content-[''] ${activeIndex === i ? "bg-white" : "bg-white/50"
            }`}
          onClick={() => setActiveIndex(i)}
        />
      ))}
    </div>
  ),[]);

  const PrevArrow = useCallback(({ handlePrev }: CarouselArrowProps) => (
    <button
      onClick={handlePrev}
      className="absolute top-2/4 left-4 -translate-y-2/4 rounded-full bg-white/30 p-3 text-white hover:bg-white/60 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 19.5L8.25 12l7.5-7.5"
        />
      </svg>
    </button>
  ),[]);

  const NextArrow = useCallback(({ handleNext }: CarouselArrowProps) => (
    <button
      onClick={handleNext}
      className="absolute top-2/4 !right-4 -translate-y-2/4 rounded-full bg-white/30 p-3 text-white hover:bg-white/60 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </button>
  ),[]);

const handleProfileClick = useCallback(async () => {
  try {
    navigate(`${USER.VENDORLIST}`);
  } catch (error) {
    console.error("Profile Error", error);
    showToastMessage("Error during loading profile", "error");
  }
}, [navigate]);
 const viewPorfolio = useCallback((vendorId: string) => {

    console.log("Navigating with Vendor ID:", vendorId)

    if (!vendorId) {
        console.error("Vendor ID is undefined")
        return
    }

    navigate(`${USER.PORTFOLIO}/${vendorId}`)

}, [navigate])

  return (
    <>
      <HeroBanner />

      <section className="relative container mx-auto px-4 mb-3">
        <h2 className="text-4xl font-light tracking-[0.3em] text-[#B8860B] py-10 md:py-20 uppercase text-center">
          Popular Vendors
        </h2>
        <div className="flex justify-center items-center w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          {vendors.map((vendor, index) => (
            <motion.div
              key={index}
              className="relative w-1/5 md:w-2/12 h-full cursor-pointer overflow-hidden border border-gray-300"
              whileHover={{
                width: '25%',
                transition: { duration: 0.5, ease: [0.43, 0.13, 0.23, 0.96] }
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => viewPorfolio(vendor._id)}
            >
             <LazyLoadImage
  src={vendor.imageUrl || '/images/p5.jpg'}
  alt={vendor.name}
  effect="blur"
  className="w-full h-full object-cover"
/>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end justify-center p-2 md:p-4">
                <h3 className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-center">
                  {vendor.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-xl text-yellow-600 font-light tracking-wide mb-2">MOMENTS</h3>
            <h2 className="text-4xl font-serif font-light text-gray-900">What We Do</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {services.slice(0,3).map((service, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full aspect-square mb-6 overflow-hidden border border-gray-200">
                 <LazyLoadImage
  src={service.image}
  alt={service.title}
  effect="blur"
  className="w-full h-full object-cover"
/>
                </div>
                <h3 className="text-xl font-serif font-light mb-4 text-gray-900">{service.title}</h3>
                <p className="text-sm text-center text-gray-600 max-w-xs">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Add to your existing @import or <style> block ── */}
{/*
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*/}

<section className="relative py-24 overflow-hidden" style={{ background: '#0F0E0C' }}>

  {/* Background grid texture */}
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(184,134,11,0.04) 60px),
      repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(184,134,11,0.04) 60px)
    `
  }}/>

  {/* Gold top rule */}
  <div style={{
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: '120px', height: '1px',
    background: 'linear-gradient(90deg, transparent, #B8860B, transparent)'
  }}/>

  <div className="container mx-auto px-6 relative z-10">

    {/* Section header */}
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-center mb-16"
    >
      <span style={{
        display: 'block', fontSize: '10px', letterSpacing: '0.45em',
        color: '#9B9590', textTransform: 'uppercase',
        fontFamily: "'DM Sans', sans-serif", marginBottom: '14px'
      }}>
        What We Offer
      </span>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(2.4rem, 5vw, 4rem)',
        fontWeight: 300, color: '#fff',
        letterSpacing: '0.1em', lineHeight: 1.1
      }}>
        Our <em style={{ fontStyle: 'italic', color: '#D4A017' }}>Services</em>
      </h2>
      <div style={{
        width: '48px', height: '1px', margin: '20px auto 0',
        background: 'linear-gradient(90deg, transparent, #B8860B, transparent)'
      }}/>
    </motion.div>

    {/* Cards grid */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))',
      gap: '2px',          /* thin gold seam between cards */
      background: 'rgba(184,134,11,0.15)',
      border: '1px solid rgba(184,134,11,0.15)',
      maxWidth: '1100px',
      margin: '0 auto',
    }}>
      {CATEGORIES.map((category, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: index * 0.1 }}
          style={{ position: 'relative', background: '#0F0E0C', overflow: 'hidden', cursor: 'pointer' }}
          className="group"
          onClick={handleProfileClick}
        >
          {/* Image — sharp rectangle, no border-radius */}
          <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden' }}>
            <LazyLoadImage
              src={category.image}
              alt={category.title}
              loading="lazy"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.7s cubic-bezier(0.23, 1, 0.32, 1)',
                filter: 'brightness(0.75) saturate(0.9)',
              }}
              className="group-hover:scale-105 group-hover:brightness-90"
            />
            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(15,14,12,0.9) 0%, transparent 55%)',
              transition: 'opacity 0.4s ease',
            }}/>
            {/* Index number — editorial touch */}
            <span style={{
              position: 'absolute', top: '16px', right: '20px',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1rem', fontWeight: 300, color: 'rgba(184,134,11,0.6)',
              letterSpacing: '0.1em',
            }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* Text content */}
          <div style={{ padding: '28px 32px 32px' }}>
            {/* Gold rule above title */}
            <div style={{
              width: '32px', height: '1px', marginBottom: '16px',
              background: '#B8860B',
              transition: 'width 0.4s ease',
            }} className="group-hover:w-16"/>

            <h3 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.75rem', fontWeight: 300, color: '#fff',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: '10px', lineHeight: 1.2,
            }}>
              {category.title}
            </h3>

            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.875rem', color: '#9B9590',
              lineHeight: 1.7, letterSpacing: '0.01em',
              marginBottom: '24px',
            }}>
              {category.description}
            </p>

            {/* CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={handleProfileClick}
                style={{  
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '10px', fontWeight: 500,
                  letterSpacing: '0.35em', textTransform: 'uppercase',
                  color: '#B8860B', background: 'transparent',
                  border: '1px solid rgba(184,134,11,0.4)',
                  padding: '10px 24px', cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#B8860B';
                  (e.currentTarget as HTMLButtonElement).style.color = '#0F0E0C';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = '#B8860B';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#B8860B';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(184,134,11,0.4)';
                }}
              >
                Explore
              </button>

              {/* Arrow line */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                color: 'rgba(184,134,11,0.4)',
                transition: 'all 0.3s ease',
              }} className="group-hover:text-yellow-600">
                <div style={{ width: '24px', height: '1px', background: 'currentColor' }}/>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1 4h6M4 1l3 3-3 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Bottom rule */}
    <div style={{
      width: '120px', height: '1px', margin: '64px auto 0',
      background: 'linear-gradient(90deg, transparent, #B8860B, transparent)'
    }}/>
  </div>
</section>

     
      <div className="relative">
        <Carousel
          autoplay
          loop
          placeholder={undefined}
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
          className="rounded-xl h-[80vh]"
          navigation={CarouselNavigation}
          prevArrow={PrevArrow}
          nextArrow={NextArrow}
        >
          {CAROUSEL_IMAGES.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`image ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ))}
        </Carousel>
      </div>

      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-xl text-yellow-600 font-light tracking-wide mb-2">MOMENTS</h3>
            <h2 className="text-4xl font-serif font-light text-gray-900">What We Do</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {services.slice(3,6).map((service, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full aspect-square mb-6 overflow-hidden border border-gray-200">
                 <LazyLoadImage
  src={service.image}
  alt={service.title}
  effect="blur"
  className="w-full h-full object-cover"
/>
                </div>
                <h3 className="text-xl font-serif font-light mb-4 text-gray-900">{service.title}</h3>
                <p className="text-sm text-center text-gray-600 max-w-xs">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default React.memo(HeroSection);