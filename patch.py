import re

with open('src/pages/CreateHiring.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
if 'createCampaign' not in content:
    content = content.replace(
        "import type { AIRecruiter, ParsedCandidate, CreateHiringForm, EmploymentType } from '../types';",
        "import { createCampaign, uploadCandidateFiles } from '../services/campaignService';\nimport type { AIRecruiter, ParsedCandidate, CreateHiringForm, EmploymentType } from '../types';"
    )

# 2. State
if 'const [jdFileObj' not in content:
    content = content.replace(
        "const [jdFileName, setJdFileName] = useState('');",
        "const [jdFileName, setJdFileName] = useState('');\n  const [jdFileObj, setJdFileObj] = useState<File | null>(null);"
    )
    content = content.replace(
        "const [resumeFiles, setResumeFiles] = useState<string[]>([]);",
        "const [resumeFiles, setResumeFiles] = useState<string[]>([]);\n  const [resumeFileObjs, setResumeFileObjs] = useState<File[]>([]);"
    )
    content = content.replace(
        "const [parseError, setParseError] = useState('');",
        "const [parseError, setParseError] = useState('');\n  const [launching, setLaunching] = useState(false);"
    )

# 3. Handle JD File
content = content.replace(
    "setJdFileName(file.name);",
    "setJdFileName(file.name);\n      setJdFileObj(file);"
)
content = content.replace(
    "setJdFileName(''); setJdText('');",
    "setJdFileName(''); setJdText(''); setJdFileObj(null);"
)

# 4. Handle Resume Files
content = content.replace(
    "setResumeFiles(prev => [...prev, ...files.map(f => f.name)]);",
    "setResumeFiles(prev => [...prev, ...files.map(f => f.name)]);\n      setResumeFileObjs(prev => [...prev, ...files]);"
)
content = content.replace(
    "setResumeFiles([]); setResumeMode(null);",
    "setResumeFiles([]); setResumeFileObjs([]); setResumeMode(null);"
)

# 5. Launch
old_launch = '''  const launch = (mode: 'screen_only' | 'screen_and_call') => {
    if (!validate()) return;
    const hiringId = `h_${Date.now()}`;
    const now = new Date().toISOString();
    dispatch({
      type: 'CREATE_HIRING',
      payload: {
        id: hiringId, title: form.title, location: form.location,
        employmentType: form.employmentType as EmploymentType,
        description: form.description, jdText,
        jdFileName: jdFileName || undefined, resumeCount: totalResumes,
        status: 'screening', aiRecruiterId: selectedRecruiter!.id,
        interviewInstructions: instructions || selectedRecruiter!.interviewInstructions,
        candidateIds: [], candidateCount: 0,
        contacted: 0, connected: 0, interested: 0, shortlisted: 0,
        createdAt: now, updatedAt: now,
      },
    });
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: `act_create_${Date.now()}`, type: 'hiring_created',
        hiringTitle: form.title,
        description: `${form.title} hiring created — AI resume screening starting`,
        timestamp: now, timeAgo: 'just now',
      },
    });
    navigate(`/hiring/${hiringId}/screening?resumes=${totalResumes}&mode=${mode}`);
  };'''

new_launch = '''  const launch = async (mode: 'screen_only' | 'screen_and_call') => {
    if (!validate()) return;
    setLaunching(true);
    try {
      const campaign = await createCampaign({
        title: form.title,
        rawText: jdFileObj ? undefined : jdText,
        file: jdFileObj || undefined,
        required_fields: {
          location: form.location,
          employment_type: form.employmentType,
          role_summary: form.description,
          aiRecruiterId: selectedRecruiter!.id, // Passed so backend can use it
        },
      });
      
      const hiringId = campaign.id;
      
      if (resumeFileObjs.length > 0) {
        await uploadCandidateFiles(hiringId, resumeFileObjs);
      }

      const now = new Date().toISOString();
      dispatch({
        type: 'CREATE_HIRING',
        payload: {
          id: hiringId, title: campaign.title, location: form.location,
          employmentType: form.employmentType as EmploymentType,
          description: form.description, jdText: campaign.raw_text || jdText,
          jdFileName: jdFileName || undefined, resumeCount: totalResumes,
          status: 'screening', aiRecruiterId: selectedRecruiter!.id,
          interviewInstructions: instructions || selectedRecruiter!.interviewInstructions,
          candidateIds: [], candidateCount: 0,
          contacted: 0, connected: 0, interested: 0, shortlisted: 0,
          createdAt: campaign.created_at, updatedAt: campaign.updated_at,
        },
      });
      dispatch({
        type: 'ADD_ACTIVITY',
        payload: {
          id: `act_create_${Date.now()}`, type: 'hiring_created',
          hiringTitle: campaign.title,
          description: `${campaign.title} hiring created — AI resume screening starting`,
          timestamp: now, timeAgo: 'just now',
        },
      });
      navigate(`/hiring/${hiringId}/screening?resumes=${totalResumes}&mode=${mode}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create campaign', 'error');
    } finally {
      setLaunching(false);
    }
  };'''

content = content.replace(old_launch, new_launch)

# 6. Buttons
content = content.replace(
    "<Button onClick={() => launch('screen_only')}",
    "<Button disabled={launching} loading={launching} onClick={() => launch('screen_only')}"
)
content = content.replace(
    "<Button variant=\"secondary\" icon={<Play size={15} fill=\"currentColor\" />} onClick={() => launch('screen_and_call')}",
    "<Button disabled={launching} loading={launching} variant=\"secondary\" icon={<Play size={15} fill=\"currentColor\" />} onClick={() => launch('screen_and_call')}"
)

with open('src/pages/CreateHiring.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
