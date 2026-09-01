import Tier12Section from './sections/tier12'
import Tier34Section from './sections/tier34'
import ChartsDesignPreviewSection from './sections/charts'

export default function DesignPreviewPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Design System & Foundation Preview</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Live component and section showcase for Wave 3 redesign.
        </p>
      </div>
      <div id="design-preview-sections" className="space-y-8">
        <Tier12Section />
        <Tier34Section />
        <ChartsDesignPreviewSection />
      </div>
    </div>
  )
}
