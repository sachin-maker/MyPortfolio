import type { Metadata } from "next";
import HomeHero from "./components/portfolio/home-hero";
import ScrollReveal from "./components/portfolio/scroll-reveal";
import { Suspense } from "react";
import FeaturedProjects from "./components/portfolio/featured-projects";
import SkillsSection from "@/app/components/portfolio/skills-section";
import ExperienceSection from "@/app/components/portfolio/experience-section";
import EducationSection from "@/app/components/portfolio/education-section";
import AboutSection from "@/app/components/portfolio/about-section";
import ContactSection from "@/app/components/portfolio/contact-section";



export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover Sachin Deshpande's frontend development projects and engineering experience.",
};



export default function HomePage() {
  return (

    <main>
      <HomeHero />

      <AboutSection />


      <Suspense
        fallback={
          <section
            id="skills"
            className="border-y border-white/[0.06] px-6 py-24 md:px-12"
          >
            <div className="mx-auto max-w-6xl">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                Technologies
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                Tools I build with
              </h2>
              <p className="mt-8 text-sm text-zinc-400">
                Loading skills...
              </p>
            </div>
          </section>
        }
      >
        <SkillsSection />
      </Suspense>

      <Suspense
        fallback={
          <section className="px-6 py-24 md:px-12 md:py-32">
            <div className="mx-auto max-w-6xl">
              <p className="text-violet-300">Selected work</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                Projects that solve problems
              </h2>
              <p className="mt-8 text-zinc-400">Loading projects...</p>
            </div>
          </section>
        }
      >
        <FeaturedProjects />
      </Suspense>

      <Suspense
        fallback={
          <section
            id="experience"
            className="border-y border-white/[0.06] px-6 py-24 md:px-12"
          >
            <div className="mx-auto max-w-6xl">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                Experience
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                Engineering with impact
              </h2>
              <p className="mt-8 text-sm text-zinc-400">
                Loading experience...
              </p>
            </div>
          </section>
        }
      >
        <ExperienceSection />
      </Suspense>


      <Suspense
        fallback={
          <section
            id="education"
            className="border-y border-white/[0.06] px-6 py-24 md:px-12"
          >
            <div className="mx-auto max-w-6xl">
              <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                Education
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                Learning and growth
              </h2>
              <p className="mt-8 text-sm text-zinc-400">
                Loading education...
              </p>
            </div>
          </section>
        }
      >
        <EducationSection />
      </Suspense>


      <ContactSection />

      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-sm text-zinc-500">
        © 2026 Sachin Deshpande. Built with Next.js and TypeScript.
      </footer>
    </main>
  );
}