# Graph Report - .  (2026-04-26)

## Corpus Check
- 87 files · ~100,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 281 nodes · 204 edges · 6 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Blog Admin Dashboard|Blog Admin Dashboard]]
- [[_COMMUNITY_AI Link Manager|AI Link Manager]]
- [[_COMMUNITY_Table Editor Modal|Table Editor Modal]]
- [[_COMMUNITY_Blog Editor Modal|Blog Editor Modal]]
- [[_COMMUNITY_AI Agent Generator|AI Agent Generator]]
- [[_COMMUNITY_Voice Chat Widget|Voice Chat Widget]]

## God Nodes (most connected - your core abstractions)
1. `handleGenerate()` - 3 edges
2. `handleGenerate()` - 3 edges
3. `handleSubmit()` - 3 edges
4. `fetchExternalSuggestions()` - 2 edges
5. `fetchSuggestions()` - 2 edges
6. `parseFrontmatter()` - 2 edges
7. `cleanupAiContent()` - 2 edges
8. `handleAnalyze()` - 2 edges
9. `onAnalysisComplete()` - 2 edges
10. `parseFrontmatter()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 1 - "Blog Admin Dashboard"
Cohesion: 0.12
Nodes (5): cleanupAiContent(), handleAnalyze(), handleGenerate(), onAnalysisComplete(), parseFrontmatter()

### Community 2 - "AI Link Manager"
Cohesion: 0.2
Nodes (2): fetchExternalSuggestions(), fetchSuggestions()

### Community 3 - "Table Editor Modal"
Cohesion: 0.22
Nodes (2): handleUpdate(), serializeToMarkdown()

### Community 4 - "Blog Editor Modal"
Cohesion: 0.32
Nodes (3): cleanupAiContent(), handleGenerate(), parseFrontmatter()

### Community 5 - "AI Agent Generator"
Cohesion: 0.32
Nodes (3): fileToBase64(), generateKnowledgeBase(), handleSubmit()

### Community 6 - "Voice Chat Widget"
Cohesion: 0.33
Nodes (2): sendMessage(), speak()

## Knowledge Gaps
- **Thin community `AI Link Manager`** (11 nodes): `Accordion()`, `fetchExternalSuggestions()`, `fetchSuggestions()`, `handleApplyAll()`, `handleApplySuggestion()`, `handleDeleteLink()`, `handleFinalizeAndSave()`, `handleUpdateLink()`, `searchWithBrave()`, `SuggestionCard()`, `AiLinkManagerModal.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Table Editor Modal`** (10 nodes): `TableEditorModal.tsx`, `addColumn()`, `addRow()`, `handleCellChange()`, `handleHeaderChange()`, `handleUpdate()`, `parseMarkdown()`, `removeColumn()`, `removeRow()`, `serializeToMarkdown()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Voice Chat Widget`** (7 nodes): `handleNavAction()`, `handleToggleMute()`, `sendMessage()`, `speak()`, `startRecording()`, `stopRecording()`, `ChatWidget.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._