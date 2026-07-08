import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Target, Users } from 'lucide-react';
import api from '../services/api';
import { buildImageUrl, imageFallbackByKey } from '../utils/helpers';
import { fallbackTeam } from '../utils/siteData';

export default function About() {
  const [teamMembers, setTeamMembers] = useState(fallbackTeam);
  const coreValues = [
    {
      icon: Target,
      title: 'Results-Driven',
      text: 'We focus on solutions that deliver measurable business outcomes, not just beautiful code.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      text: 'We constantly explore new technologies to provide our clients with a competitive edge.'
    },
    {
      icon: Users,
      title: 'Partnership',
      text: 'We view our clients as long-term partners, committing to their ongoing success.'
    }
  ];

  useEffect(() => {
    let active = true;

    api.get('/team', { params: { page: 1, limit: 12 } })
      .then((response) => {
        if (!active) return;
        const items = response.data.data || [];
        setTeamMembers(items.length > 0 ? items : fallbackTeam);
      })
      .catch(() => {
        if (!active) return;
        setTeamMembers(fallbackTeam);
      });

    return () => {
      active = false;
    };
  }, []);

  // Use the site team-working hero image for the About right-side illustration
  const heroImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80';
  const heroImageFallback = imageFallbackByKey('team');

  function TeamMemberCard({ member }) {
    const [src, setSrc] = useState(null);

    useEffect(() => {
      let active = true;
      const candidate = member.image_url || member.image;
      if (!candidate) {
        setSrc(imageFallbackByKey(member.name));
        return () => { active = false; };
      }

      // Build a usable URL (relative or absolute)
      const url = buildImageUrl(candidate, imageFallbackByKey(member.name));

      // Check resource existence with a HEAD fetch to avoid attaching a failing
      // <img> src immediately which triggers a visible 404 in the console.
      (async () => {
        try {
          const res = await fetch(url, { method: 'HEAD', mode: 'cors' });
          if (!active) return;
          if (res.ok) {
            setSrc(url);
          } else {
            setSrc(imageFallbackByKey(member.name));
          }
        } catch (err) {
          if (!active) return;
          setSrc(imageFallbackByKey(member.name));
        }
      })();

      return () => { active = false; };
    }, [member]);

    const initials = member.name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 1)
      .join('')
      .toUpperCase();

    return (
      <motion.div
        key={member.id}
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
      >
        {src ? (
          <img
            src={src}
            alt={member.name}
            onError={(e) => { e.currentTarget.src = imageFallbackByKey(member.name); }}
            className="h-[250px] w-full object-cover bg-[#eaf1ff]"
          />
        ) : (
          <div className="flex h-[250px] items-center justify-center bg-[#eaf1ff]">
            <span className="text-3xl font-semibold text-[#2f6df7]">{initials}</span>
          </div>
        )}

        <div className="border-t border-slate-200 px-4 py-4 text-center">
          <h3 className="text-[0.95rem] font-bold tracking-tight text-[#163c88]">{member.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{member.designation}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white text-slate-900">
      <section className="bg-[#102c66] px-4 py-16 text-center text-white sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-3xl"
        >
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">About Anova Technologies</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
            We are a full-service digital solutions company passionate about helping businesses establish a powerful digital identity and achieve online success.
          </p>
        </motion.div>
      </section>

      <section className="section-shell py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="grid items-center gap-12 lg:grid-cols-[0.98fr_1.02fr]"
        >
          <div>
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Our Story</p>
            <div className="mt-4 max-w-xl space-y-4 text-sm leading-7 text-slate-600 sm:text-base">
              <p>
                Founded in India, Anova Technologies started with a simple yet powerful vision: to bridge the gap between innovative ideas and cutting-edge technology.
              </p>
              <p>
                We understood early on that in today&apos;s fast-paced digital landscape, a business needs more than just a website, it needs a comprehensive digital identity that resonates with its audience and drives growth.
              </p>
              <p>
                Today, we are proud to be the technology partner for numerous businesses, delivering everything from high-performance web applications to strategic digital marketing campaigns. Our success is measured entirely by the success of our clients.
              </p>
            </div>
          </div>

          <div className="justify-self-center lg:justify-self-end">
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="overflow-hidden rounded-[18px] shadow-[0_20px_55px_rgba(15,23,42,0.18)] w-full max-w-[420px]"
            >
              <img
                src={buildImageUrl(heroImage, heroImageFallback)}
                alt="Team collaboration"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.src = heroImageFallback; }}
                className="w-full h-auto sm:h-[420px] object-cover rounded-[18px]"
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Our Core Values</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              These principles guide every project we undertake and every line of code we write.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {coreValues.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45 }}
                  className="rounded-[16px] border border-slate-200 bg-white px-6 py-8 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
                >
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#2f6df7] text-white shadow-[0_10px_24px_rgba(47,109,247,0.18)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-[1.02rem] font-semibold text-[#163c88]">{item.title}</h3>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{item.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f8fbff] py-16 sm:py-20">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-2xl font-semibold tracking-tight text-[#163c88] sm:text-[2rem]">Meet Our Experts</p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              The talented individuals behind our successful projects.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {teamMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
