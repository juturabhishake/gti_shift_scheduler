'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Save, AlertTriangle, Loader2, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIssues } from '@/app/ng_major_issues/context/IssuesContext';
import Combobox from '@/components/ng_issues/Combobox';
import StatusPill from '@/components/ng_issues/StatusPill';
import { useAccessCheck } from "@/lib/useAccessCheck";
const EMPTY_SECTION_1 = {
  IssueNumber: '',
  DateRaised: '',
  TimeRaised: '',
  RaisedSection: '',
  SubSection: '',
  RaisedPersonId: '',
  RaisedPersonName: '',
  TypeOfRequest: '',
  Description: '',
  EffectsOn: '',
  ResponsibleSection: '',
  FirstLevelInformedId: '',
  FirstLevelInformedName: '',
  ResponsibleSectionHeadId: '',
  ResponsibleSectionHeadName: '',
};

const EMPTY_SECTION_2 = {
  PriorityCategory: '',
  ExpectedTargetDate: '',
  SubmissionStatus: '',
};

const EMPTY_SECTION_3 = {
  HandlerGivenTarget: '',
  ActualTaskCompletionDate: '',
  TaskCompletionStatusByHandler: '',
  TaskCompletionStatusByPPC: '',
  TaskCompletionPeriod: '',
};

function calcPeriod(dateRaised, actualCompletion) {
  if (!dateRaised || !actualCompletion) return '';
  const d1 = new Date(dateRaised);
  const d2 = new Date(actualCompletion);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  if (isNaN(diff)) return '';
  return `${diff} days`;
}

function FieldLabel({ htmlFor, required = true, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-semibold text-foreground/85 mb-1.5"
    >
      {children} {required && <span className="text-destructive">*</span>}
    </label>
  );
}

function inputCls(disabled) {
  return cn(
    'h-10 w-full rounded-lg border border-border/80 bg-card/60 px-3.5 text-sm shadow-sm backdrop-blur transition-all',
    'text-foreground placeholder:text-muted-foreground outline-none',
    'focus:border-primary focus:ring-2 focus:ring-primary/20',
    disabled && 'cursor-not-allowed opacity-50 bg-muted/40'
  );
}

function readOnlyCls() {
  return cn(
    'h-10 w-full rounded-lg border border-border/50 bg-muted/30 px-3.5 text-sm',
    'text-muted-foreground cursor-default select-all'
  );
}

function SectionCard({ title, children, locked, lockReason, onSave, onReset, saveState, validationError }) {
  return (
    <div className={cn(
      "rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl transition-all",
      locked ? "border-border/40 opacity-70" : "border-border/80 hover:border-border"
    )}>
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-base font-semibold tracking-tight text-foreground">{title}</span>
        </div>
        {locked && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md">
            <AlertTriangle className="size-3.5 shrink-0" />
            <span>{lockReason}</span>
          </div>
        )}
      </div>

      <div>{children}</div>

      {!locked && onSave && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-5 border-t border-border/60">
          <div className="flex-1">
            {validationError ? (
              <div className="flex items-center gap-2 text-xs font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 animate-in fade-in">
                <AlertTriangle className="size-4 shrink-0 text-destructive" />
                <span>{validationError}</span>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-2.5 shrink-0 w-full sm:w-auto">
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={saveState === 'loading'}
                className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-card/60 px-3.5 text-xs font-medium text-foreground hover:bg-accent transition-all shadow-sm"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={saveState === 'loading'}
              className={cn(
                'flex h-9 min-w-[130px] items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold shadow-sm transition-all',
                saveState === 'idle' && 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95',
                saveState === 'loading' && 'bg-primary/70 text-primary-foreground cursor-wait',
                saveState === 'success' && 'bg-emerald-600 text-white animate-in zoom-in-95',
                saveState === 'error' && 'bg-destructive text-destructive-foreground animate-in shake'
              )}
            >
              {saveState === 'loading' && <Loader2 className="size-3.5 animate-spin" />}
              {saveState === 'success' && <CheckCircle2 className="size-3.5 animate-bounce" />}
              {saveState === 'error' && <XCircle className="size-3.5 animate-bounce" />}
              {saveState === 'idle' && <Save className="size-3.5" />}

              <span>
                {saveState === 'loading'
                  ? 'Saving...'
                  : saveState === 'success'
                  ? 'Saved!'
                  : saveState === 'error'
                  ? 'Error!'
                  : `Save ${title}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function IssueFormContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id');
  const isEditMode = Boolean(idParam);
  const PAGE_ID_FOR_THIS_FORM = 2034;
  
  const {
    isLoading: isAccessLoading,
    hasAccess,
  } = useAccessCheck(PAGE_ID_FOR_THIS_FORM);
  const { dropdowns, currentUser, allUsers, hosUsers } = useIssues();

  const [recordId, setRecordId] = useState(0);
  const [sec1, setSec1] = useState({ ...EMPTY_SECTION_1 });
  const [sec2, setSec2] = useState({ ...EMPTY_SECTION_2 });
  const [sec3, setSec3] = useState({ ...EMPTY_SECTION_3 });

  const [loading, setLoading] = useState(Boolean(idParam));
  const [saveState1, setSaveState1] = useState('idle');
  const [saveState2, setSaveState2] = useState('idle');
  const [saveState3, setSaveState3] = useState('idle');

  const [valError1, setValError1] = useState('');
  const [valError2, setValError2] = useState('');
  const [valError3, setValError3] = useState('');

  const isClosed =
    sec3.TaskCompletionStatusByHandler === 'Closed' &&
    sec3.TaskCompletionStatusByPPC === 'Closed';

  const isSec1Complete = Boolean(
    recordId > 0 &&
    sec1.IssueNumber &&
    sec1.DateRaised &&
    sec1.TimeRaised &&
    sec1.RaisedSection &&
    sec1.SubSection &&
    sec1.RaisedPersonId &&
    sec1.TypeOfRequest &&
    sec1.Description &&
    sec1.EffectsOn &&
    sec1.ResponsibleSection &&
    sec1.FirstLevelInformedId &&
    sec1.ResponsibleSectionHeadId
  );

  const isSec2Complete = Boolean(
    isSec1Complete &&
    sec2.PriorityCategory &&
    sec2.ExpectedTargetDate &&
    sec2.SubmissionStatus
  );

  const canEditSection2 = !isClosed && isSec1Complete;
  const canEditSection3 = !isClosed && isSec1Complete && isSec2Complete;
  const section1Disabled = isClosed;

  useEffect(() => {
    if (!idParam) return;
    let cancelled = false;

    fetch('/api/issues/list?viewType=ALL&employeeId=ALL')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch records');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const record = (Array.isArray(data) ? data : []).find(
          (r) => String(r.Id) === String(idParam)
        );
        if (record) {
          setRecordId(record.Id ?? 0);
          setSec1({
            IssueNumber: record.IssueNumber ?? '',
            DateRaised: record.DateRaised?.split('T')[0] ?? '',
            TimeRaised: record.TimeRaised ?? '',
            RaisedSection: record.RaisedSection ?? '',
            SubSection: record.SubSection ?? '',
            RaisedPersonId: record.RaisedPersonId ?? '',
            RaisedPersonName: record.RaisedPersonName ?? '',
            TypeOfRequest: record.TypeOfRequest ?? '',
            Description: record.Description ?? '',
            EffectsOn: record.EffectsOn ?? '',
            ResponsibleSection: record.ResponsibleSection ?? '',
            FirstLevelInformedId: record.FirstLevelInformedId ?? '',
            FirstLevelInformedName: record.FirstLevelInformedName ?? '',
            ResponsibleSectionHeadId: record.ResponsibleSectionHeadId ?? '',
            ResponsibleSectionHeadName: record.ResponsibleSectionHeadName ?? '',
          });
          setSec2({
            PriorityCategory: record.PriorityCategory ?? '',
            ExpectedTargetDate: record.ExpectedTargetDate?.split('T')[0] ?? '',
            SubmissionStatus: record.SubmissionStatus ?? '',
          });
          setSec3({
            HandlerGivenTarget: record.HandlerGivenTarget?.split('T')[0] ?? '',
            ActualTaskCompletionDate: record.ActualTaskCompletionDate?.split('T')[0] ?? '',
            TaskCompletionStatusByHandler: record.TaskCompletionStatusByHandler ?? '',
            TaskCompletionStatusByPPC: record.TaskCompletionStatusByPPC ?? '',
            TaskCompletionPeriod: record.TaskCompletionPeriod ?? '',
          });
        } else {
          toast.error(`Record #${idParam} not found.`);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Load error:', err);
          toast.error('Failed to load record.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idParam]);

  function getUserTag() {
    if (currentUser?.EmployeeId) {
      return `${currentUser.EmployeeId} | ${currentUser.Username || ''}`;
    }
    return 'System';
  }

  async function postIssueData(customPayload, setSaveState) {
    setSaveState('loading');
    try {
      const fullPayload = {
        Id: recordId,
        ...sec1,
        ...sec2,
        ...sec3,
        ...customPayload,
        UserTag: getUserTag(),
      };

      const res = await fetch('/api/issues/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error ?? 'Save failed');
      }

      const resData = await res.json();
      if (resData.id) {
        setRecordId(resData.id);
      }
      if (resData.issueNumber && !sec1.IssueNumber) {
        setSec1((p) => ({ ...p, IssueNumber: resData.issueNumber }));
      }

      setSaveState('success');
      toast.success('Section saved successfully!');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setSaveState('error');
      toast.error(err.message ?? 'Failed to save section.');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  function handleSaveSection1() {
    const required = [
      ['Issue Number', sec1.IssueNumber],
      ['Date Raised', sec1.DateRaised],
      ['Raised Time', sec1.TimeRaised],
      ['Raised Section', sec1.RaisedSection],
      ['Sub Section', sec1.SubSection],
      ['Raised Person', sec1.RaisedPersonId],
      ['Type of Request', sec1.TypeOfRequest],
      ['Description', sec1.Description],
      ['Effects On', sec1.EffectsOn],
      ['Responsible Section', sec1.ResponsibleSection],
      ['First Level Contact', sec1.FirstLevelInformedId],
      ['Responsible Section Head', sec1.ResponsibleSectionHeadId],
    ];

    const missing = required
      .filter(([, val]) => !val || String(val).trim() === '')
      .map(([name]) => name);

    if (missing.length > 0) {
      setValError1(`Missing required fields: ${missing.join(', ')}`);
      toast.error(`Please fill all required fields (${missing.length} missing)`);
      return;
    }

    setValError1('');
    postIssueData(sec1, setSaveState1);
  }

  function handleSaveSection2() {
    const required = [
      ['Priority Category', sec2.PriorityCategory],
      ['Expected Target Date', sec2.ExpectedTargetDate],
      ['Submission Status', sec2.SubmissionStatus],
    ];

    const missing = required
      .filter(([, val]) => !val || String(val).trim() === '')
      .map(([name]) => name);

    if (missing.length > 0) {
      setValError2(`Missing required fields: ${missing.join(', ')}`);
      toast.error(`Please fill all required fields (${missing.length} missing)`);
      return;
    }

    setValError2('');
    postIssueData(sec2, setSaveState2);
  }

  function handleSaveSection3() {
    const required = [
      ['Handler Given Target', sec3.HandlerGivenTarget],
      ['Actual Completion Date', sec3.ActualTaskCompletionDate],
      ['Task Completion Status by Handler', sec3.TaskCompletionStatusByHandler],
      ['Task Completion Status by PPC', sec3.TaskCompletionStatusByPPC],
    ];

    const missing = required
      .filter(([, val]) => !val || String(val).trim() === '')
      .map(([name]) => name);

    if (missing.length > 0) {
      setValError3(`Missing required fields: ${missing.join(', ')}`);
      toast.error(`Please fill all required fields (${missing.length} missing)`);
      return;
    }

    setValError3('');
    const calculated = calcPeriod(sec1.DateRaised, sec3.ActualTaskCompletionDate);
    const updatedSec3 = { ...sec3, TaskCompletionPeriod: calculated };
    setSec3(updatedSec3);

    postIssueData(updatedSec3, setSaveState3);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[360px]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading record...</span>
        </div>
      </div>
    );
  }

  const userOptions = allUsers.map((u) => ({
    EmployeeId: u.EmployeeId,
    Username: u.Username,
    value: u.EmployeeId,
    label: `${u.EmployeeId} - ${u.Username} (${u.Position || u.Department || 'Staff'})`,
  }));

  const hosOptions = hosUsers.map((u) => ({
    EmployeeId: u.EmployeeId,
    Username: u.Username,
    value: u.EmployeeId,
    label: `${u.EmployeeId} - ${u.Username} (${u.Position || 'HOS'})`,
  }));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between gap-4 px-2 py-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {recordId ? `Edit Issue #${sec1.IssueNumber || recordId}` : 'New Issue Entry'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sequential section entry with independent validations and audit tagging.
          </p>
        </div>

        {sec3.TaskCompletionStatusByHandler && (
          <StatusPill status={sec3.TaskCompletionStatusByHandler} size="md" />
        )}
      </div>

      {isClosed && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertTriangle className="size-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Record Closed</p>
            <p className="text-xs text-muted-foreground">
              This issue has been closed by both Handler and PPC. All fields are locked.
            </p>
          </div>
        </div>
      )}

      <SectionCard
        title="Issue Details"
        locked={section1Disabled}
        lockReason="Closed"
        onSave={handleSaveSection1}
        onReset={() => {
          setSec1({ ...EMPTY_SECTION_1 });
          setValError1('');
        }}
        saveState={saveState1}
        validationError={valError1}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="IssueNumber">Issue Number</FieldLabel>
            <input
              id="IssueNumber"
              type="text"
              value={sec1.IssueNumber}
              onChange={(e) => setSec1((p) => ({ ...p, IssueNumber: e.target.value }))}
              placeholder="Enter Issue Number (e.g. 10112601)"
              disabled={section1Disabled}
              className={inputCls(section1Disabled)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="DateRaised">Date Raised</FieldLabel>
            <input
              id="DateRaised"
              type="date"
              value={sec1.DateRaised}
              onChange={(e) => setSec1((p) => ({ ...p, DateRaised: e.target.value }))}
              disabled={section1Disabled}
              className={inputCls(section1Disabled)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="TimeRaised">Raised Time</FieldLabel>
            <input
              id="TimeRaised"
              type="time"
              value={sec1.TimeRaised}
              onChange={(e) => setSec1((p) => ({ ...p, TimeRaised: e.target.value }))}
              disabled={section1Disabled}
              className={inputCls(section1Disabled)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="RaisedSection">Raised Section</FieldLabel>
            <Combobox
              options={dropdowns.RaisedSection || []}
              value={sec1.RaisedSection}
              onChange={(val) => setSec1((p) => ({ ...p, RaisedSection: val }))}
              placeholder="Select Raised Section"
              disabled={section1Disabled}
            />
          </div>

          <div>
            <FieldLabel htmlFor="SubSection">Sub Section</FieldLabel>
            <Combobox
              options={dropdowns.SubSection || []}
              value={sec1.SubSection}
              onChange={(val) => setSec1((p) => ({ ...p, SubSection: val }))}
              placeholder="Select Sub Section"
              disabled={section1Disabled}
            />
          </div>

          <div>
            <FieldLabel>Raised Person</FieldLabel>
            <Combobox
              options={userOptions}
              value={sec1.RaisedPersonId}
              onChange={(val) => {
                const u = allUsers.find((x) => x.EmployeeId === val);
                setSec1((p) => ({ ...p, RaisedPersonId: val, RaisedPersonName: u?.Username || '' }));
              }}
              placeholder="Select Raised Person"
              disabled={section1Disabled}
            />
          </div>

          <div>
            <FieldLabel htmlFor="TypeOfRequest">Type of Request</FieldLabel>
            <Combobox
              options={dropdowns.TypeOfRequest || []}
              value={sec1.TypeOfRequest}
              onChange={(val) => setSec1((p) => ({ ...p, TypeOfRequest: val }))}
              placeholder="Select Request Type"
              disabled={section1Disabled}
            />
          </div>

          <div>
            <FieldLabel htmlFor="EffectsOn">Effects On</FieldLabel>
            <Combobox
              options={dropdowns.EffectsOn || []}
              value={sec1.EffectsOn}
              onChange={(val) => setSec1((p) => ({ ...p, EffectsOn: val }))}
              placeholder="Select Effects On"
              disabled={section1Disabled}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="Description">Description</FieldLabel>
            <textarea
              id="Description"
              value={sec1.Description}
              onChange={(e) => setSec1((p) => ({ ...p, Description: e.target.value }))}
              disabled={section1Disabled}
              rows={3}
              placeholder="Describe the issue in detail..."
              className={cn(
                'w-full rounded-xl border border-border/80 bg-card/60 p-3.5 text-sm shadow-sm backdrop-blur transition-all resize-y',
                'text-foreground placeholder:text-muted-foreground outline-none',
                'focus:border-primary focus:ring-2 focus:ring-primary/20',
                section1Disabled && 'cursor-not-allowed opacity-50 bg-muted/40'
              )}
            />
          </div>

          <div>
            <FieldLabel htmlFor="ResponsibleSection">Responsible Section</FieldLabel>
            <Combobox
              options={dropdowns.ResponsibleSection || []}
              value={sec1.ResponsibleSection}
              onChange={(val) => setSec1((p) => ({ ...p, ResponsibleSection: val }))}
              placeholder="Select Responsible Section"
              disabled={section1Disabled}
            />
          </div>

          <div>
            <FieldLabel>Issue Informed to First Level</FieldLabel>
            <Combobox
              options={hosOptions}
              value={sec1.FirstLevelInformedId}
              onChange={(val) => {
                const u = allUsers.find((x) => x.EmployeeId === val);
                setSec1((p) => ({ ...p, FirstLevelInformedId: val, FirstLevelInformedName: u?.Username || '' }));
              }}
              placeholder="Select First Level Contact"
              disabled={section1Disabled}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel>Responsible Section Head</FieldLabel>
            <Combobox
              options={hosOptions}
              value={sec1.ResponsibleSectionHeadId}
              onChange={(val) => {
                const u = hosUsers.find((x) => x.EmployeeId === val);
                setSec1((p) => ({ ...p, ResponsibleSectionHeadId: val, ResponsibleSectionHeadName: u?.Username || '' }));
              }}
              placeholder="Select Section Head (HOS)"
              disabled={section1Disabled}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="PPC"
        locked={!canEditSection2}
        lockReason={
          isClosed
            ? 'Closed'
            : !recordId
            ? 'Issue details not found'
            : !isSec1Complete
            ? 'Issue details must be saved first'
            : undefined
        }
        onSave={handleSaveSection2}
        onReset={() => {
          setSec2({ ...EMPTY_SECTION_2 });
          setValError2('');
        }}
        saveState={saveState2}
        validationError={valError2}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-3">
          <div>
            <FieldLabel htmlFor="PriorityCategory">Priority Category</FieldLabel>
            <Combobox
              options={dropdowns.PriorityCategory || []}
              value={sec2.PriorityCategory}
              onChange={(val) => setSec2((p) => ({ ...p, PriorityCategory: val }))}
              placeholder="Select Priority"
              disabled={!canEditSection2}
            />
          </div>

          <div>
            <FieldLabel htmlFor="ExpectedTargetDate">Expected Target Date</FieldLabel>
            <input
              id="ExpectedTargetDate"
              type="date"
              value={sec2.ExpectedTargetDate}
              onChange={(e) => setSec2((p) => ({ ...p, ExpectedTargetDate: e.target.value }))}
              disabled={!canEditSection2}
              className={inputCls(!canEditSection2)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="SubmissionStatus">Submission Status</FieldLabel>
            <Combobox
              options={dropdowns.SubmissionStatus || []}
              value={sec2.SubmissionStatus}
              onChange={(val) => setSec2((p) => ({ ...p, SubmissionStatus: val }))}
              placeholder="Select Status"
              disabled={!canEditSection2}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Handler"
        locked={!canEditSection3}
        lockReason={
          isClosed
            ? 'Closed'
            : !recordId
            ? 'Issue details not found'
            : !isSec1Complete
            ? 'Issue details must be saved first'
            : !isSec2Complete
            ? 'PPC details must be saved first'
            : undefined
        }
        onSave={handleSaveSection3}
        onReset={() => {
          setSec3({ ...EMPTY_SECTION_3 });
          setValError3('');
        }}
        saveState={saveState3}
        validationError={valError3}
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <FieldLabel htmlFor="HandlerGivenTarget">Handler Given Target</FieldLabel>
            <input
              id="HandlerGivenTarget"
              type="date"
              value={sec3.HandlerGivenTarget}
              onChange={(e) => setSec3((p) => ({ ...p, HandlerGivenTarget: e.target.value }))}
              disabled={!canEditSection3}
              className={inputCls(!canEditSection3)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="ActualTaskCompletionDate">Actual Task Completion Date</FieldLabel>
            <input
              id="ActualTaskCompletionDate"
              type="date"
              value={sec3.ActualTaskCompletionDate}
              onChange={(e) => {
                const dateVal = e.target.value;
                const calc = calcPeriod(sec1.DateRaised, dateVal);
                setSec3((p) => ({
                  ...p,
                  ActualTaskCompletionDate: dateVal,
                  TaskCompletionPeriod: calc,
                }));
              }}
              disabled={!canEditSection3}
              className={inputCls(!canEditSection3)}
            />
          </div>

          <div>
            <FieldLabel htmlFor="TaskCompletionStatusByHandler">Task Completion Status — By Handler</FieldLabel>
            <Combobox
              options={dropdowns.TaskCompletionStatusByHandler || []}
              value={sec3.TaskCompletionStatusByHandler}
              onChange={(val) => setSec3((p) => ({ ...p, TaskCompletionStatusByHandler: val }))}
              placeholder="Select Handler Status"
              disabled={!canEditSection3}
            />
          </div>

          <div>
            <FieldLabel htmlFor="TaskCompletionStatusByPPC">Task Completion Status — By PPC</FieldLabel>
            <Combobox
              options={dropdowns.TaskCompletionStatusByPPC || []}
              value={sec3.TaskCompletionStatusByPPC}
              onChange={(val) => setSec3((p) => ({ ...p, TaskCompletionStatusByPPC: val }))}
              placeholder="Select PPC Status"
              disabled={!canEditSection3}
            />
          </div>

          <div className="md:col-span-2">
            <FieldLabel htmlFor="TaskCompletionPeriod" required={false}>Task Completion Period</FieldLabel>
            <div className="flex items-center gap-3">
              <input
                id="TaskCompletionPeriod"
                type="text"
                value={sec3.TaskCompletionPeriod}
                readOnly
                placeholder="Auto-calculated from Date Raised & Actual Date"
                className={readOnlyCls()}
              />
              {sec3.TaskCompletionPeriod && (
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {sec3.TaskCompletionPeriod}
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export default function IssueFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center min-h-[360px]">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      }
    >
      <IssueFormContent />
    </Suspense>
  );
}
