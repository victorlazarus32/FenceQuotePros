// Top-level: assembles the design canvas with all wireframe sections.

const App = () => {
  return (
    <DesignCanvas>
      <DCSection id="intro" title="00 — Brief & system" subtitle="What's locked, what's up for grabs.">
        <DCArtboard id="intro-cover"  label="Cover"          width={920} height={580}><IntroCover /></DCArtboard>
        <DCArtboard id="intro-system" label="Visual system"  width={920} height={580}><IntroSystem /></DCArtboard>
        <DCArtboard id="intro-map"    label="Screens map"    width={920} height={580}><IntroMap /></DCArtboard>
      </DCSection>

      <DCSection id="logo" title="01 — Logo & wordmark" subtitle="Existing mark anchors. Three companions to pressure-test.">
        <DCArtboard id="logo-a" label="A · Existing mark"            width={520} height={400}><LogoA /></DCArtboard>
        <DCArtboard id="logo-b" label="B · Picket-letter monogram"   width={520} height={400}><LogoB /></DCArtboard>
        <DCArtboard id="logo-c" label="C · Stencil wordmark"         width={520} height={400}><LogoC /></DCArtboard>
        <DCArtboard id="logo-d" label="D · Stamp / seal"             width={520} height={400}><LogoD /></DCArtboard>
      </DCSection>

      <DCSection id="newest" title="02 — /estimates/new — mobile" subtitle="Driveway. 5 minutes. Glove on. Four flow models.">
        <DCArtboard id="ne-a" label="A · Single scrolling page"     width={400} height={780}><NewEstA /></DCArtboard>
        <DCArtboard id="ne-b" label="B · Step wizard, sticky total" width={400} height={780}><NewEstB /></DCArtboard>
        <DCArtboard id="ne-c" label="C · Calculator-first"          width={400} height={780}><NewEstC /></DCArtboard>
        <DCArtboard id="ne-d" label="D · Conversational chips"      width={400} height={780}><NewEstD /></DCArtboard>
      </DCSection>

      <DCSection id="doc" title="03 — Customer-facing estimate" subtitle="Wins or loses the deal. Print-safe, bilingual-safe.">
        <DCArtboard id="doc-a" label="A · Classic invoice, refined"  width={680} height={900}><DocA /></DCArtboard>
        <DCArtboard id="doc-b" label="B · Banded header + signature" width={680} height={900}><DocB /></DCArtboard>
        <DCArtboard id="doc-c" label="C · Sidebar totals (modern)"   width={680} height={900}><DocC /></DCArtboard>
        <DCArtboard id="doc-d" label="D · Watermarked status"        width={680} height={900}><DocD /></DCArtboard>
      </DCSection>

      <DCSection id="dash" title="04 — Dashboard" subtitle="What does Victor see Tuesday morning?">
        <DCArtboard id="dash-a" label="A · KPI grid, refined"         width={1000} height={640}><DashA /></DCArtboard>
        <DCArtboard id="dash-b" label="B · Pipeline-first kanban"     width={1000} height={640}><DashB /></DCArtboard>
        <DCArtboard id="dash-c" label="C · Today feed + week chart"   width={1000} height={640}><DashC /></DCArtboard>
        <DCArtboard id="dash-d" label="D · Cash-flow hero"            width={1000} height={640}><DashD /></DCArtboard>
      </DCSection>

      <DCSection id="comp" title="05 — Compliance warnings" subtitle="Florida pool / HVHZ. Authoritative, not alarming.">
        <DCArtboard id="comp-a" label="A · Inline pill on field"      width={540} height={380}><CompA /></DCArtboard>
        <DCArtboard id="comp-b" label="B · Stacked banner card"       width={540} height={380}><CompB /></DCArtboard>
        <DCArtboard id="comp-c" label="C · Side rail + code ref"      width={540} height={380}><CompC /></DCArtboard>
        <DCArtboard id="comp-d" label="D · Hard-block modal"          width={540} height={380}><CompD /></DCArtboard>
      </DCSection>

      <DCSection id="embed" title="06 — Embed lead-intake widget" subtitle="Drops on the marketing site. Homeowner's first impression.">
        <DCArtboard id="em-a" label="A · Compact card"                width={460} height={640}><EmbedA /></DCArtboard>
        <DCArtboard id="em-b" label="B · 3-step progressive"          width={460} height={640}><EmbedB /></DCArtboard>
        <DCArtboard id="em-c" label="C · Hero + form"                 width={680} height={640}><EmbedC /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
