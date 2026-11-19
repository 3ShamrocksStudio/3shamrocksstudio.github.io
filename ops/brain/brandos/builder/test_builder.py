#!/usr/bin/env python3
"""Builder tests (stdlib unittest). Run: python3 ops/brain/brandos/builder/test_builder.py"""
import json, os, subprocess, sys, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.path.dirname(HERE)
ROOT = os.path.abspath(os.path.join(BRAND, "..", "..", ".."))
SPRINT = os.path.join(ROOT, "sprint", "index.html")
HAND = os.path.join(BRAND, "scorer", "genome-3s.json")
OUT = os.path.join(HERE, "out", "genome-3s-draft.json")
sys.path.insert(0, HERE)
import genome_build


def build_draft():
    g = genome_build.build([SPRINT], "3Shamrocks Studio")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(g, f, indent=2, ensure_ascii=False)
        f.write("\n")
    return g


class TestBuilder(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.draft = build_draft()
        with open(HAND) as fh:
            cls.hand = json.load(fh)

    def test_1_recall_vs_hand_genome(self):
        d, h = self.draft, self.hand
        got_hex = {p["hex"].lower() for p in d["palette"]}
        in_sprint = [p for p in h["palette"] if any(s.startswith("sprint/index.html") for s in p["sources"])]
        out_scope = [p for p in h["palette"] if p not in in_sprint]
        hits = [p for p in in_sprint if p["hex"].lower() in got_hex]
        got_fonts = {f.lower() for f in d["fonts"]["allowed"]}
        hand_fonts = [f for f in h["fonts"]["allowed"]]
        fhits = [f for f in hand_fonts if f.lower() in got_fonts]
        hand_hex = {p["hex"].lower() for p in h["palette"]}
        extra_pal = [p["hex"] for p in d["palette"] if p["hex"].lower() not in hand_hex]
        extra_fonts = [f for f in d["fonts"]["allowed"] if f.lower() not in {x.lower() for x in hand_fonts}]
        print("\n  %-26s %-10s %s" % ("item", "hand", "draft"))
        for p in h["palette"]:
            scope = "sprint" if p in in_sprint else "other-file"
            print("  %-26s %-10s %s" % ("palette " + p["hex"] + " " + p["name"], scope, "FOUND" if p["hex"].lower() in got_hex else "missing"))
        for f in hand_fonts:
            print("  %-26s %-10s %s" % ("font " + f, "sprint", "FOUND" if f.lower() in got_fonts else "missing"))
        print("  palette recall (sprint-sourced): %d/%d" % (len(hits), len(in_sprint)))
        print("  palette not checkable from sprint: %s (sourced only from other files)" % ", ".join(p["hex"] for p in out_scope))
        print("  font recall: %d/%d" % (len(fhits), len(hand_fonts)))
        print("  extras in draft palette: %s; extra fonts: %s" % (extra_pal or "none", extra_fonts or "none"))
        self.assertEqual(len(hits), len(in_sprint))
        self.assertEqual(len(fhits), len(hand_fonts))
        self.assertEqual(extra_fonts, [])

    def test_sources_and_flags(self):
        d = self.draft
        self.assertIs(d["draft"], True)
        self.assertTrue(d["needs_review"])
        for p in d["palette"]:
            self.assertTrue(p["sources"])
            for s in p["sources"]:
                self.assertRegex(s, r"^.+:\d+$")
        for k in ("banned_pronouns", "banned_words", "fake_urgency_patterns"):
            self.assertEqual(d["voice"][k], [])
        self.assertEqual(d["claims"]["sources"], [])
        self.assertNotIn("ledger", d["claims"])

    def test_deterministic(self):
        self.assertEqual(json.dumps(genome_build.build([SPRINT], "X"), sort_keys=True),
                         json.dumps(genome_build.build([SPRINT], "X"), sort_keys=True))

    def test_2_scorer_loads_draft(self):
        r = subprocess.run([sys.executable, os.path.join(BRAND, "scorer", "scorer.py"), SPRINT, "--genome", OUT],
                           capture_output=True, text=True)
        print("\n  scorer exit=%d, stdout head: %s" % (r.returncode, (r.stdout.strip().splitlines() or [""])[0][:160]))
        self.assertNotIn("Traceback", r.stderr)
        self.assertIn(r.returncode, (0, 1))
        sys.path.insert(0, os.path.join(BRAND, "scorer"))
        import scorer
        rep = scorer.score(SPRINT, OUT)
        print("  score=%s verdict=%s checks=%s" % (rep["score"], rep["verdict"],
              {k: v["violations"] for k, v in rep["checks"].items()}))
        self.assertIsInstance(rep["score"], int)

    def test_3_existing_suites(self):
        for rel in ("scorer/tests/run_tests.py", "demo/run_demo_tests.py"):
            r = subprocess.run([sys.executable, os.path.join(BRAND, rel)], capture_output=True, text=True, cwd=ROOT)
            tail = (r.stdout.strip().splitlines() or [""])[-1]
            print("\n  %s exit=%d: %s" % (rel, r.returncode, tail))
            self.assertEqual(r.returncode, 0, r.stdout[-500:] + r.stderr[-500:])


if __name__ == "__main__":
    unittest.main(verbosity=2)
