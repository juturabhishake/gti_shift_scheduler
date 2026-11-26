import prisma from '@/lib/prisma';
import Cors from 'cors';

const cors = Cors({
  methods: ['POST', 'HEAD'],
  origin: '*',
  allowedHeaders: ['Content-Type'],
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

function escapeXml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      Id = 0,
      SNo = 0,
      IssueNumber,
      DateRaised,
      TimeRaised,
      RaisedSection,
      SubSection,
      RaisedPersonId,
      RaisedPersonName,
      TypeOfRequest,
      Description,
      EffectsOn,
      ResponsibleSection,
      FirstLevelInformedId,
      FirstLevelInformedName,
      ResponsibleSectionHeadId,
      ResponsibleSectionHeadName,
      PriorityCategory,
      ExpectedTargetDate,
      SubmissionStatus,
      HandlerGivenTarget,
      ActualTaskCompletionDate,
      TaskCompletionStatusByHandler,
      TaskCompletionStatusByPPC,
      TaskCompletionPeriod,
      UserTag = '',
    } = req.body;

    const xmlData =
      `<Root><Issue>` +
      `<Id>${escapeXml(Id)}</Id>` +
      `<SNo>${escapeXml(SNo)}</SNo>` +
      `<IssueNumber>${escapeXml(IssueNumber)}</IssueNumber>` +
      `<DateRaised>${escapeXml(DateRaised)}</DateRaised>` +
      `<TimeRaised>${escapeXml(TimeRaised)}</TimeRaised>` +
      `<RaisedSection>${escapeXml(RaisedSection)}</RaisedSection>` +
      `<SubSection>${escapeXml(SubSection)}</SubSection>` +
      `<RaisedPersonId>${escapeXml(RaisedPersonId)}</RaisedPersonId>` +
      `<RaisedPersonName>${escapeXml(RaisedPersonName)}</RaisedPersonName>` +
      `<TypeOfRequest>${escapeXml(TypeOfRequest)}</TypeOfRequest>` +
      `<Description>${escapeXml(Description)}</Description>` +
      `<EffectsOn>${escapeXml(EffectsOn)}</EffectsOn>` +
      `<ResponsibleSection>${escapeXml(ResponsibleSection)}</ResponsibleSection>` +
      `<FirstLevelInformedId>${escapeXml(FirstLevelInformedId)}</FirstLevelInformedId>` +
      `<FirstLevelInformedName>${escapeXml(FirstLevelInformedName)}</FirstLevelInformedName>` +
      `<ResponsibleSectionHeadId>${escapeXml(ResponsibleSectionHeadId)}</ResponsibleSectionHeadId>` +
      `<ResponsibleSectionHeadName>${escapeXml(ResponsibleSectionHeadName)}</ResponsibleSectionHeadName>` +
      `<PriorityCategory>${escapeXml(PriorityCategory)}</PriorityCategory>` +
      `<ExpectedTargetDate>${escapeXml(ExpectedTargetDate)}</ExpectedTargetDate>` +
      `<SubmissionStatus>${escapeXml(SubmissionStatus)}</SubmissionStatus>` +
      `<HandlerGivenTarget>${escapeXml(HandlerGivenTarget)}</HandlerGivenTarget>` +
      `<ActualTaskCompletionDate>${escapeXml(ActualTaskCompletionDate)}</ActualTaskCompletionDate>` +
      `<TaskCompletionStatusByHandler>${escapeXml(TaskCompletionStatusByHandler)}</TaskCompletionStatusByHandler>` +
      `<TaskCompletionStatusByPPC>${escapeXml(TaskCompletionStatusByPPC)}</TaskCompletionStatusByPPC>` +
      `<TaskCompletionPeriod>${escapeXml(TaskCompletionPeriod)}</TaskCompletionPeriod>` +
      `<UserTag>${escapeXml(UserTag)}</UserTag>` +
      `</Issue></Root>`;

    const result = await prisma.$queryRawUnsafe(
      `EXEC sp_SaveMajorIssue @XmlData = N'${xmlData.replace(/'/g, "''")}'`
    );

    const savedId = result && result[0] ? result[0].NewId || result[0].Id || result[0].id || Id : Id;
    const issueNum = result && result[0] ? result[0].IssueNumber || IssueNumber : IssueNumber;

    return res.status(200).json({ success: true, id: savedId, issueNumber: issueNum });
  } catch (error) {
    console.error('Error saving issue:', error);
    return res.status(500).json({ error: 'Failed to save issue', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
