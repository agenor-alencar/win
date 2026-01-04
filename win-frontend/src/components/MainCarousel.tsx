import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { bannerApi, type Banner } from "@/lib/bannerApi";

// Importar estilos do Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

/**
 * Componente de carrossel de banners para a home page
 * Utiliza Swiper.js para o carrossel e Framer Motion para animações
 */
export default function MainCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar banners ativos da API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const data = await bannerApi.listarBannersAtivos();
        setBanners(data);
      } catch (err) {
        console.error("Erro ao buscar banners:", err);
        setError("Não foi possível carregar os banners");
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Variantes de animação do Framer Motion
  const textVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full h-[400px] lg:h-[500px] bg-gradient-to-r from-primary to-secondary animate-pulse rounded-xl" />
    );
  }

  // Error state
  if (error || banners.length === 0) {
    return null; // Não exibir nada se não houver banners
  }

  return (
    <div className="relative w-full group">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          prevEl: ".swiper-button-prev-custom",
          nextEl: ".swiper-button-next-custom",
        }}
        pagination={{
          clickable: true,
          el: ".swiper-pagination-custom",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={banners.length > 1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        className="rounded-xl overflow-hidden shadow-2xl"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-[400px] lg:h-[500px]">
              {/* Imagem de fundo com lazy loading */}
              <img
                src={banner.imagemUrl}
                alt={banner.titulo}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Overlay gradiente para melhor legibilidade do texto */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

              {/* Conteúdo do banner */}
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  {/* Título com animação */}
                  <motion.h2
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={textVariants}
                    className="text-3xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 drop-shadow-lg"
                  >
                    {banner.titulo}
                  </motion.h2>

                  {/* Subtítulo com animação */}
                  {banner.subtitulo && (
                    <motion.p
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                      variants={{
                        ...textVariants,
                        visible: {
                          ...textVariants.visible,
                          transition: {
                            ...textVariants.visible.transition,
                            delay: 0.2,
                          },
                        },
                      }}
                      className="text-lg lg:text-xl xl:text-2xl text-white/90 mb-6 lg:mb-8 drop-shadow-md"
                    >
                      {banner.subtitulo}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navegação customizada - setas */}
      {banners.length > 1 && (
        <>
          <button
            className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 hover:bg-white text-primary rounded-full p-2 lg:p-3 
                     shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:scale-110 transform"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>

          <button
            className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 hover:bg-white text-primary rounded-full p-2 lg:p-3 
                     shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     hover:scale-110 transform"
            aria-label="Próximo banner"
          >
            <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </>
      )}

      {/* Paginação customizada */}
      {banners.length > 1 && (
        <div className="swiper-pagination-custom !bottom-4 flex justify-center gap-2" />
      )}

      {/* Estilos customizados para a paginação */}
      <style>{`
        .swiper-pagination-custom .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.5);
          opacity: 1;
          transition: all 0.3s ease;
        }
        
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          width: 30px;
          border-radius: 5px;
          background: white;
        }

        @media (min-width: 1024px) {
          .swiper-pagination-custom .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
          }
          
          .swiper-pagination-custom .swiper-pagination-bullet-active {
            width: 40px;
          }
        }
      `}</style>
    </div>
  );
}
