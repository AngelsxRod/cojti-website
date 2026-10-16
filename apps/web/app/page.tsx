import type { Link } from '@cojti/api';

import styles from './page.module.css';

async function getLinks(): Promise<Link[]> {
  try {
    const response = await fetch(
      `${process.env.API_URL ?? 'http://localhost:3000'}/links`,
      { cache: 'no-store' },
    );
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const links = await getLinks();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a
          className={styles.brand}
          href="#inicio"
          aria-label="Demetrio Cojtí Cuxil, inicio"
        >
          <span className={styles.monogram} aria-hidden="true">
            DC
          </span>
          <span>Demetrio Cojtí Cuxil</span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#acerca">Acerca del sitio</a>
          {links.length > 0 && <a href="#enlaces">Enlaces</a>}
        </nav>
      </header>

      <main id="inicio">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Sitio personal</p>
            <h1 id="hero-title">
              Demetrio
              <br />
              <em>Cojtí Cuxil</em>
            </h1>
            <p className={styles.lead}>
              Un espacio dedicado a reunir información sobre su trayectoria,
              publicaciones y actividades.
            </p>
            <a className={styles.heroLink} href="#acerca">
              Conocer el sitio <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.artLine} />
            <span className={styles.artLetters}>
              D<br />C
            </span>
            <span className={styles.artCaption}>DEMETRIO COJTÍ CUXIL</span>
          </div>
        </section>

        <section
          id="acerca"
          className={styles.about}
          aria-labelledby="about-title"
        >
          <p className={styles.sectionNumber}>01 / ACERCA</p>
          <div>
            <h2 id="about-title">Un lugar para compartir su obra</h2>
            <p>
              Este sitio está en preparación. Aquí se podrán consultar
              materiales, novedades y enlaces relacionados con Demetrio Cojtí
              Cuxil.
            </p>
          </div>
        </section>

        {links.length > 0 && (
          <section
            id="enlaces"
            className={styles.links}
            aria-labelledby="links-title"
          >
            <p className={styles.sectionNumber}>02 / ENLACES</p>
            <div>
              <h2 id="links-title">Enlaces de interés</h2>
              <ul>
                {links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{link.title}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                    <p>{link.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <span>Demetrio Cojtí Cuxil</span>
        <span>Sitio personal</span>
      </footer>
    </div>
  );
}
