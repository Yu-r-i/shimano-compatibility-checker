/**
 * src/pages/AboutPage.tsx
 */

import styles from "../styles/AboutPage.module.css";

export default function AboutPage() {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>About Shimano Compatibility Checker</h2>
      <p>
        This web application helps you verify mechanical compatibility between
        Shimano bicycle components such as shifters, derailleurs, cassettes,
        and chains. By selecting parts from each category, the app checks
        whether their specifications match based on gear speed, actuation type,
        and other relevant attributes.
      </p>
      <p>
        The compatibility rules in this tool are based on general Shimano
        standards and public specifications. Always confirm with the official
        Shimano compatibility charts or technical documentation before making
        purchase decisions.
      </p>
      <h3 className={styles.subtitle}>Planned Features</h3>
      <ul>
        <li>Support for brake system compatibility (rim / disc)</li>
        <li>Freehub body standard checks (HG11, Microspline, etc.)</li>
        <li>Di2 / e-Tube generation compatibility</li>
        <li>Filtering and sorting parts list</li>
      </ul>
      <p className={styles.note}>
        Disclaimer: This app is not affiliated with Shimano Inc.
      </p>
    </div>
  );
}
