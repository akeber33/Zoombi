import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {

  return (
    <>

      <div className={styles.firstScreen}>

        <main className={styles.mainContent}>
          <div className={styles.imageContainer}>
            <Image
              src="/zoombi.gif"
              alt="Personagem zoombi com chapéu de formatura"
              width={400}
              height={400}
              unoptimized
            />
          </div>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>
              Organize sua vida acadêmica com <span className={styles.zoombiText}><b>zoombi</b></span>
            </h1>
          </div>
        </main>
        <Link href="/login">
          <button className={styles.ctaButton}>
            Junte-se a Horda
          </button>
        </Link>

      </div>

      {/* SEGUNDA TELA: Esta tela aparece quando você rola a página para baixo
      */}
      <div className={styles.secondScreen}>
        <h2>Bem-vindo ao cemitério acadêmico!</h2>
        <p>A vida universitária não precisa ser um pesadelo.</p>
      </div>
    </>
  );
}