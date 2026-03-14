import { useEffect, useMemo, useState } from 'react'
import './App.css'
import NetworkGraph from './components/NetworkGraph'
import WorldMap from './components/WorldMap'

type Lang = 'en' | 'de' | 'fr'
type View = 'world' | 'signals' | 'archive' | 'analysis' | 'theories' | 'map' | 'settings'

type Place = {
  id: string
  title: string
  description: string
  country: string
  coords: [number, number]
  timestamp: string
  signalSources: string[]
  anomalies: string[]
  archiveRefs: string[]
  signalStrength: number
}

type Signal = {
  id: string
  type: 'Radiowellen' | 'Morsecode' | 'Verzerrte Sprache' | 'Glitch-Video' | 'Codierter Text' | 'Digitales Artefakt'
  source: string
  strength: number
  status: 'unstable' | 'stable' | 'decoding'
}

type ArchiveDoc = {
  id: string
  type: string
  title: string
  redacted: boolean
  stamped: boolean
  note: string
}

const places: Place[] = [
  {
    id: 'LOC-001',
    title: 'Verlassene Flughafenhalle',
    description: 'Große Leere, periodisches Neonflackern, diffuse Lautsprecherechos.',
    country: 'Deutschland',
    coords: [50.1109, 8.6821],
    timestamp: '1998-11-03T23:14:00Z',
    signalSources: ['Tower Relay A', 'Terminal PA Ghost'],
    anomalies: ['Zeitversatz +4s', 'Echo ohne Quelle'],
    archiveRefs: ['ARC-114', 'INT-009'],
    signalStrength: 81,
  },
  {
    id: 'LOC-002',
    title: 'Leeres Einkaufszentrum',
    description: 'Rolltreppen stehen still, Musik läuft in unvollständigen Loops.',
    country: 'USA',
    coords: [34.0522, -118.2437],
    timestamp: '2004-06-17T02:41:00Z',
    signalSources: ['Mall Node C', 'Camera Bus 7'],
    anomalies: ['Kamerabild mit Doppelzeit'],
    archiveRefs: ['REP-320', 'MAP-031'],
    signalStrength: 67,
  },
  {
    id: 'LOC-003',
    title: 'Hotelflur mit endlosen Türen',
    description: 'Symmetrische Türenfolge; Zählungen ergeben unterschiedliche Ergebnisse.',
    country: 'Frankreich',
    coords: [48.8566, 2.3522],
    timestamp: '2010-01-12T01:08:00Z',
    signalSources: ['Hallway Mic', 'Room Bus E'],
    anomalies: ['Topologische Schleife'],
    archiveRefs: ['OBS-877', 'WARN-002'],
    signalStrength: 88,
  },
  {
    id: 'LOC-004',
    title: 'Parkhaus mit gelbem Licht',
    description: 'Konstantes Summen, Lichtfarbe driftet im 90-Sekunden-Rhythmus.',
    country: 'Japan',
    coords: [35.6762, 139.6503],
    timestamp: '2016-09-22T03:19:00Z',
    signalSources: ['Sodium Grid 2', 'Ramp Sensor'],
    anomalies: ['Frequenzspike bei 13.7kHz'],
    archiveRefs: ['EXP-044', 'ARC-552'],
    signalStrength: 74,
  },
  {
    id: 'LOC-005',
    title: 'U-Bahnstation nach Betriebsschluss',
    description: 'Wind ohne Zugverkehr, Ansagen in fragmentierter Sprache.',
    country: 'Norwegen',
    coords: [59.9139, 10.7522],
    timestamp: '2021-04-06T00:33:00Z',
    signalSources: ['Platform Array', 'Control Room B'],
    anomalies: ['Morse-Signatur im Rauschen'],
    archiveRefs: ['LOG-213', 'INT-611'],
    signalStrength: 92,
  },
]

const signals: Signal[] = [
  { id: 'SIG-01', type: 'Radiowellen', source: 'Tower Relay A', strength: 81, status: 'stable' },
  { id: 'SIG-02', type: 'Morsecode', source: 'Platform Array', strength: 92, status: 'decoding' },
  { id: 'SIG-03', type: 'Verzerrte Sprache', source: 'Terminal PA Ghost', strength: 73, status: 'unstable' },
  { id: 'SIG-04', type: 'Glitch-Video', source: 'Camera Bus 7', strength: 66, status: 'decoding' },
  { id: 'SIG-05', type: 'Codierter Text', source: 'Archive Loop', strength: 58, status: 'stable' },
]

const docs: ArchiveDoc[] = [
  { id: 'ARC-114', type: 'Forschungsbericht', title: 'Perzeptionsdrift in Transitknoten', redacted: true, stamped: true, note: 'Randnotiz: "Nicht in Öffentlichkeit."' },
  { id: 'INT-009', type: 'Interview', title: 'Zeuge: Terminal 4 / Nachtbetrieb', redacted: false, stamped: true, note: 'Audiofragment 03 beschädigt.' },
  { id: 'WARN-002', type: 'Warnmeldung', title: 'Nichtlineare Raumsequenz', redacted: true, stamped: true, note: 'Freigabe nur Level 03.' },
  { id: 'MAP-031', type: 'Kartenfragment', title: 'Sektor-Skizze Nordwest', redacted: false, stamped: false, note: 'Anmerkung in roter Tinte.' },
]

const text = {
  de: {
    title: 'HCSMEDIA LIMINAL SYSTEM',
    subtitle: 'Liminale Exploration · Archive · Analyse · Narrative Rätsel',
    pick: 'Sprache wählen',
    boot: 'SYSTEM INITIALISIERT',
    bootLogs: ['loading archive nodes', 'scanning signal channels', 'synchronizing world map', 'initializing anomaly detection'],
    nav: ['WORLD', 'SIGNALS', 'ARCHIVE', 'ANALYSIS', 'THEORIES', 'MAP', 'SETTINGS'],
    made: 'HCSMEDIA — made with ❤️ by HCSMEDIA',
  },
  en: {
    title: 'HCSMEDIA LIMINAL SYSTEM',
    subtitle: 'Liminal exploration · archive intelligence · anomaly analysis',
    pick: 'Choose language',
    boot: 'SYSTEM INITIALIZING',
    bootLogs: ['loading archive nodes', 'scanning signal channels', 'synchronizing world map', 'initializing anomaly detection'],
    nav: ['WORLD', 'SIGNALS', 'ARCHIVE', 'ANALYSIS', 'THEORIES', 'MAP', 'SETTINGS'],
    made: 'HCSMEDIA — made with ❤️ by HCSMEDIA',
  },
  fr: {
    title: 'HCSMEDIA LIMINAL SYSTEM',
    subtitle: 'Exploration liminale · archives · analyse des anomalies',
    pick: 'Choisir la langue',
    boot: 'INITIALISATION DU SYSTÈME',
    bootLogs: ['loading archive nodes', 'scanning signal channels', 'synchronizing world map', 'initializing anomaly detection'],
    nav: ['WORLD', 'SIGNALS', 'ARCHIVE', 'ANALYSIS', 'THEORIES', 'MAP', 'SETTINGS'],
    made: 'HCSMEDIA — made with ❤️ by HCSMEDIA',
  },
} as const

const viewKeys: View[] = ['world', 'signals', 'archive', 'analysis', 'theories', 'map', 'settings']

export default function App() {
  const [lang, setLang] = useState<Lang | null>(() => {
    const stored = localStorage.getItem('hcs_lang') as Lang | null
    return stored === 'de' || stored === 'en' || stored === 'fr' ? stored : null
  })
  const [booted, setBooted] = useState(false)
  const [view, setView] = useState<View>('world')
  const [selectedPlace, setSelectedPlace] = useState(places[0])
  const [theory, setTheory] = useState('')
  const [savedTheories, setSavedTheories] = useState<string[]>(() => {
    const theories = localStorage.getItem('hcs_theories')
    return theories ? JSON.parse(theories) : []
  })
  const [clock, setClock] = useState(new Date())

  useEffect(() => {
    if (!lang) return
    const t = setTimeout(() => setBooted(true), 3400)
    return () => clearTimeout(t)
  }, [lang])

  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(iv)
  }, [])

  const t = useMemo(() => (lang ? text[lang] : null), [lang])

  const saveTheory = () => {
    if (!theory.trim()) return
    const next = [`${new Date().toISOString()} — ${theory.trim()}`, ...savedTheories]
    setSavedTheories(next)
    localStorage.setItem('hcs_theories', JSON.stringify(next))
    setTheory('')
  }

  if (!lang) {
    return (
      <div className="lang-picker">
        <h1>HCSMEDIA LIMINAL SYSTEM</h1>
        <p>{text.en.pick} / {text.de.pick} / {text.fr.pick}</p>
        <div className="lang-buttons">
          {(['de', 'en', 'fr'] as Lang[]).map((l) => (
            <button key={l} onClick={() => { localStorage.setItem('hcs_lang', l); setLang(l) }}>{l.toUpperCase()}</button>
          ))}
        </div>
        <small>{text.de.made}</small>
      </div>
    )
  }

  if (!t || !booted) {
    return (
      <div className="boot-screen">
        <h1>{t?.boot ?? text.en.boot}</h1>
        <div className="boot-logs">
          {(t?.bootLogs ?? text.en.bootLogs).map((line) => <p key={line}>{'>'} {line}</p>)}
        </div>
        <small>{t?.made ?? text.en.made}</small>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span>[ONLINE]</span>
        <span>{clock.toLocaleTimeString()}</span>
        <span>{selectedPlace.title}</span>
        <span>LANG: {lang.toUpperCase()}</span>
        <span>LEVEL: 01</span>
      </header>

      <div className="main-grid">
        <aside className="left-panel">
          {t.nav.map((label, i) => (
            <button key={label} className={viewKeys[i] === view ? 'active' : ''} onClick={() => setView(viewKeys[i])}>{label}</button>
          ))}
        </aside>

        <main className="center-panel">
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>

          {view === 'world' && (
            <div className="cards">
              {places.map((p) => (
                <article key={p.id} className={selectedPlace.id === p.id ? 'selected' : ''} onClick={() => setSelectedPlace(p)}>
                  <strong>{p.title}</strong>
                  <span>{p.description}</span>
                  <span>{p.country} · {p.timestamp}</span>
                </article>
              ))}
            </div>
          )}

          {view === 'signals' && (
            <div className="cards">
              {signals.map((s) => (
                <article key={s.id}>
                  <strong>{s.id} · {s.type}</strong>
                  <span>Quelle: {s.source}</span>
                  <span>Status: {s.status}</span>
                  <div className="meter"><div style={{ width: `${s.strength}%` }} /></div>
                </article>
              ))}
            </div>
          )}

          {view === 'archive' && (
            <div className="cards">
              {docs.map((d) => (
                <article key={d.id}>
                  <strong>{d.id} · {d.title}</strong>
                  <span>Typ: {d.type}</span>
                  <span>Stempel: {d.stamped ? 'ROT' : '—'} · Geschwärzt: {d.redacted ? 'JA' : 'NEIN'}</span>
                  <span>{d.note}</span>
                </article>
              ))}
            </div>
          )}

          {view === 'analysis' && (
            <div className="analysis-grid">
              <div className="analysis-card">
                <h4>Signalradar</h4>
                <p>Aktive Peaks: {signals.filter((s) => s.strength > 70).length}</p>
              </div>
              <div className="analysis-card">
                <h4>Netzwerkkarte (D3)</h4>
                <p>Knoten: {places.length + docs.length + places.length} · Kanten: {places.length * 2}</p>
              </div>
              <div className="analysis-card">
                <h4>Anomalie-Heatmap</h4>
                <p>Hotspot: {[...places].sort((a, b) => b.signalStrength - a.signalStrength)[0].title}</p>
              </div>
              <div className="analysis-card analysis-wide">
                <NetworkGraph places={places} docs={docs} />
              </div>
            </div>
          )}

          {view === 'theories' && (
            <div className="theory-box">
              <textarea value={theory} onChange={(e) => setTheory(e.target.value)} placeholder="Hypothese notieren..." />
              <button onClick={saveTheory}>Theorie speichern</button>
              <div className="theory-list">
                {savedTheories.map((th, i) => <p key={i}>{th}</p>)}
              </div>
            </div>
          )}

          {view === 'map' && (
            <div className="cards">
              <article className="map-card">
                <strong>Interaktive Weltkarte</strong>
                <span>Klicke einen Punkt, um den Datenknoten rechts zu fokussieren.</span>
                <WorldMap
                  places={places}
                  selectedId={selectedPlace.id}
                  onSelect={(id) => {
                    const next = places.find((p) => p.id === id)
                    if (next) setSelectedPlace(next)
                  }}
                />
              </article>
            </div>
          )}

          {view === 'settings' && (
            <div className="cards">
              <article>
                <strong>Entwicklungsschleife</strong>
                <span>PLAN → BUILD → TEST → DEBUG → DEPLOY → IMPROVE</span>
              </article>
              <article>
                <strong>Monetarisierung (optional)</strong>
                <span>Support-Spenden · Premium-Themes · Artpacks · Community-Membership</span>
              </article>
            </div>
          )}
        </main>

        <aside className="right-panel">
          <h3>DATA NODE</h3>
          <p><strong>ID:</strong> {selectedPlace.id}</p>
          <p><strong>Koordinaten:</strong> {selectedPlace.coords[0]}, {selectedPlace.coords[1]}</p>
          <p><strong>Signalquellen:</strong> {selectedPlace.signalSources.join(', ')}</p>
          <p><strong>Anomalien:</strong> {selectedPlace.anomalies.join(' · ')}</p>
          <p><strong>Archiv:</strong> {selectedPlace.archiveRefs.join(', ')}</p>
          <p><strong>Signalstärke:</strong> {selectedPlace.signalStrength}%</p>
        </aside>
      </div>

      <footer className="footer">{t.made}</footer>
    </div>
  )
}
