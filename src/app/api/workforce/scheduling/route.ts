import { NextRequest, NextResponse } from 'next/server';
import { workforceManagementEngine, Employee, Shift, WorkSchedule } from '@/lib/workforce-management-engine';

// In-memory storage for scheduling data
const schedules: Map<string, any> = new Map();
const shifts: Map<string, Shift[]> = new Map();
const timeOffRequests: Map<string, any[]> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const employeeId = searchParams.get('employeeId');
    const department = searchParams.get('department');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    switch (action) {
      case 'schedule':
        if (!employeeId) {
          return NextResponse.json(
            { error: 'employeeId parameter required' },
            { status: 400 }
          );
        }
        const schedule = await getEmployeeSchedule(employeeId, startDate || undefined, endDate || undefined);
        return NextResponse.json({
          success: true,
          data: schedule
        });

      case 'department_schedule':
        if (!department) {
          return NextResponse.json(
            { error: 'department parameter required' },
            { status: 400 }
          );
        }
        const deptSchedule = await getDepartmentSchedule(department, startDate || undefined, endDate || undefined);
        return NextResponse.json({
          success: true,
          data: deptSchedule
        });

      case 'shifts':
        const allShifts = await getShifts(department || undefined);
        return NextResponse.json({
          success: true,
          data: allShifts
        });

      case 'time_off_requests':
        const requests = await getTimeOffRequests(employeeId || undefined, department || undefined);
        return NextResponse.json({
          success: true,
          data: requests
        });

      case 'availability':
        if (!employeeId) {
          return NextResponse.json(
            { error: 'employeeId parameter required' },
            { status: 400 }
          );
        }
        const availability = await getEmployeeAvailability(employeeId, startDate || undefined, endDate || undefined);
        return NextResponse.json({
          success: true,
          data: availability
        });

      case 'workload_analysis':
        const analysis = await getWorkloadAnalysis(department || 'general', startDate || undefined, endDate || undefined);
        return NextResponse.json({
          success: true,
          data: analysis
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: schedule, department_schedule, shifts, time_off_requests, availability, or workload_analysis' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error fetching scheduling data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scheduling data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'create_shift':
        const shift = await createShift(body);
        return NextResponse.json({
          success: true,
          data: shift
        }, { status: 201 });

      case 'assign_shift':
        if (!body.employeeId || !body.shiftId || !body.date) {
          return NextResponse.json(
            { error: 'employeeId, shiftId, and date are required' },
            { status: 400 }
          );
        }

        const assignment = await assignShiftToEmployee(body.employeeId, body.shiftId, new Date(body.date));
        return NextResponse.json({
          success: true,
          data: assignment
        });

      case 'request_time_off':
        if (!body.employeeId || !body.startDate || !body.endDate || !body.type) {
          return NextResponse.json(
            { error: 'employeeId, startDate, endDate, and type are required' },
            { status: 400 }
          );
        }

        const timeOffRequest = await createTimeOffRequest(body);
        return NextResponse.json({
          success: true,
          data: timeOffRequest
        });

      case 'approve_time_off':
        if (!body.requestId) {
          return NextResponse.json(
            { error: 'requestId is required' },
            { status: 400 }
          );
        }

        const approved = await approveTimeOffRequest(body.requestId, body.approverId);
        return NextResponse.json({
          success: approved,
          message: approved ? 'Time off request approved' : 'Failed to approve request'
        });

      case 'generate_schedule':
        if (!body.department || !body.startDate || !body.endDate) {
          return NextResponse.json(
            { error: 'department, startDate, and endDate are required' },
            { status: 400 }
          );
        }

        const generatedSchedule = await generateDepartmentSchedule(body);
        return NextResponse.json({
          success: true,
          data: generatedSchedule
        });

      case 'update_availability':
        if (!body.employeeId || !body.availability) {
          return NextResponse.json(
            { error: 'employeeId and availability are required' },
            { status: 400 }
          );
        }

        const updated = await updateEmployeeAvailability(body.employeeId, body.availability);
        return NextResponse.json({
          success: updated,
          message: updated ? 'Availability updated successfully' : 'Failed to update availability'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: create_shift, assign_shift, request_time_off, approve_time_off, generate_schedule, or update_availability' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error performing scheduling operation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to perform scheduling operation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    switch (action) {
      case 'update_shift':
        if (!body.shiftId) {
          return NextResponse.json(
            { error: 'shiftId is required' },
            { status: 400 }
          );
        }

        const updatedShift = await updateShift(body.shiftId, body.updates);
        return NextResponse.json({
          success: true,
          data: updatedShift
        });

      case 'swap_shifts':
        if (!body.employeeId1 || !body.employeeId2 || !body.date) {
          return NextResponse.json(
            { error: 'employeeId1, employeeId2, and date are required' },
            { status: 400 }
          );
        }

        const swapped = await swapEmployeeShifts(body.employeeId1, body.employeeId2, new Date(body.date));
        return NextResponse.json({
          success: swapped,
          message: swapped ? 'Shifts swapped successfully' : 'Failed to swap shifts'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: update_shift or swap_shifts' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error updating scheduling data:', error);
    return NextResponse.json(
      { error: 'Failed to update scheduling data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const shiftId = searchParams.get('shiftId');
    const assignmentId = searchParams.get('assignmentId');

    switch (action) {
      case 'delete_shift':
        if (!shiftId) {
          return NextResponse.json(
            { error: 'shiftId parameter required' },
            { status: 400 }
          );
        }

        const deleted = await deleteShift(shiftId);
        return NextResponse.json({
          success: deleted,
          message: deleted ? 'Shift deleted successfully' : 'Shift not found'
        });

      case 'remove_shift_assignment':
        if (!assignmentId) {
          return NextResponse.json(
            { error: 'assignmentId parameter required' },
            { status: 400 }
          );
        }

        const removed = await removeShiftAssignment(assignmentId);
        return NextResponse.json({
          success: removed,
          message: removed ? 'Shift assignment removed' : 'Assignment not found'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter. Use: delete_shift or remove_shift_assignment' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error deleting scheduling data:', error);
    return NextResponse.json(
      { error: 'Failed to delete scheduling data' },
      { status: 500 }
    );
  }
}

// Helper functions
async function getEmployeeSchedule(employeeId: string, startDate?: string, endDate?: string): Promise<any> {
  const employee = workforceManagementEngine.getEmployee(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Get assigned shifts for the period
  const assignments = getEmployeeShiftAssignments(employeeId, start, end);

  // Get time off for the period
  const employeeTimeOff = getEmployeeTimeOff(employeeId, start, end);

  return {
    employeeId,
    employeeName: `${employee.firstName} ${employee.lastName}`,
    schedule: employee.workSchedule,
    period: { start, end },
    assignments,
    timeOff: employeeTimeOff,
    conflicts: detectScheduleConflicts(assignments, employeeTimeOff)
  };
}

async function getDepartmentSchedule(department: string, startDate?: string, endDate?: string): Promise<any> {
  const employees = workforceManagementEngine.getEmployees({ department });
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const departmentSchedule = [];

  for (const employee of employees) {
    const schedule = await getEmployeeSchedule(employee.id, startDate, endDate);
    departmentSchedule.push(schedule);
  }

  return {
    department,
    period: { start, end },
    employees: departmentSchedule,
    coverage: calculateDepartmentCoverage(departmentSchedule, start, end)
  };
}

async function getShifts(department?: string): Promise<Shift[]> {
  // Return department-specific shifts or all shifts
  if (department) {
    return shifts.get(department) || [];
  }

  // Return all shifts across departments
  const allShifts: Shift[] = [];
  for (const deptShifts of shifts.values()) {
    allShifts.push(...deptShifts);
  }
  return allShifts;
}

async function getTimeOffRequests(employeeId?: string, department?: string): Promise<any[]> {
  let requests: any[] = [];

  if (employeeId) {
    requests = timeOffRequests.get(employeeId) || [];
  } else if (department) {
    const employees = workforceManagementEngine.getEmployees({ department });
    for (const employee of employees) {
      const employeeRequests = timeOffRequests.get(employee.id) || [];
      requests.push(...employeeRequests);
    }
  } else {
    // Return all requests
    for (const employeeRequests of timeOffRequests.values()) {
      requests.push(...employeeRequests);
    }
  }

  return requests.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

async function getEmployeeAvailability(employeeId: string, startDate?: string, endDate?: string): Promise<any> {
  const employee = workforceManagementEngine.getEmployee(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Get employee's availability preferences
  const availability = {
    workDays: employee.workSchedule.workDays,
    workHours: employee.workSchedule.workHours,
    maxHoursPerWeek: 40,
    preferredShifts: ['morning', 'afternoon'],
    blockedDates: [], // Dates when employee is unavailable
    timeOff: getEmployeeTimeOff(employeeId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined)
  };

  return availability;
}

async function getWorkloadAnalysis(department: string, startDate?: string, endDate?: string): Promise<any> {
  const deptSchedule = await getDepartmentSchedule(department, startDate, endDate);

  const analysis = {
    department,
    period: deptSchedule.period,
    totalEmployees: deptSchedule.employees.length,
    scheduledHours: calculateTotalScheduledHours(deptSchedule.employees),
    averageHoursPerEmployee: 0,
    coverageGaps: identifyCoverageGaps(deptSchedule),
    overtimeHours: calculateOvertimeHours(deptSchedule.employees),
    utilizationRate: calculateUtilizationRate(deptSchedule.employees),
    recommendations: generateSchedulingRecommendations(deptSchedule)
  };

  analysis.averageHoursPerEmployee = analysis.totalEmployees > 0
    ? analysis.scheduledHours / analysis.totalEmployees
    : 0;

  return analysis;
}

function getEmployeeShiftAssignments(employeeId: string, start: Date, end: Date): any[] {
  // Mock shift assignments - in production, this would query the database
  return [
    {
      id: 'assignment-1',
      employeeId,
      shiftId: 'morning-shift',
      date: new Date(),
      status: 'confirmed'
    }
  ];
}

function getEmployeeTimeOff(employeeId: string, start?: Date, end?: Date): any[] {
  // Mock time off data
  return [];
}

function detectScheduleConflicts(assignments: any[], employeeTimeOff: any[]): any[] {
  const scheduleConflicts: any[] = [];

  for (const assignment of assignments) {
    for (const timeOffItem of employeeTimeOff) {
      if (datesOverlap(assignment.date, assignment.date, timeOffItem.startDate, timeOffItem.endDate)) {
        scheduleConflicts.push({
          type: 'time_off_conflict',
          assignmentId: assignment.id,
          timeOffId: timeOffItem.id,
          severity: 'high'
        });
      }
    }
  }

  return scheduleConflicts;
}

function calculateDepartmentCoverage(departmentSchedule: any[], start: Date, end: Date): any {
  // Calculate coverage across different time slots
  const coverage = {
    byHour: {} as Record<string, number>,
    byDay: {} as Record<string, number>,
    gaps: [] as any[]
  };

  // Simplified coverage calculation
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayKey = date.toISOString().split('T')[0];
    coverage.byDay[dayKey] = departmentSchedule.filter(emp =>
      emp.assignments.some((assignment: any) => assignment.date.toDateString() === date.toDateString())
    ).length;
  }

  return coverage;
}

async function createShift(shiftData: any): Promise<Shift> {
  const shift: Shift = {
    name: shiftData.name,
    startTime: shiftData.startTime,
    endTime: shiftData.endTime,
    breakDuration: shiftData.breakDuration || 30,
    days: shiftData.days || [1, 2, 3, 4, 5] // Monday to Friday by default
  };

  // Store shift by department
  const department = shiftData.department || 'general';
  if (!shifts.has(department)) {
    shifts.set(department, []);
  }
  shifts.get(department)!.push(shift);

  return shift;
}

async function assignShiftToEmployee(employeeId: string, shiftId: string, date: Date): Promise<any> {
  // Create shift assignment
  const assignment = {
    id: `assignment-${Date.now()}`,
    employeeId,
    shiftId,
    date,
    status: 'assigned',
    assignedAt: new Date()
  };

  // Store assignment (in production, this would be in database)
  const assignments = schedules.get(employeeId) || [];
  assignments.push(assignment);
  schedules.set(employeeId, assignments);

  return assignment;
}

async function createTimeOffRequest(requestData: any): Promise<any> {
  const request = {
    id: `timeoff-${Date.now()}`,
    employeeId: requestData.employeeId,
    type: requestData.type,
    startDate: new Date(requestData.startDate),
    endDate: new Date(requestData.endDate),
    reason: requestData.reason,
    status: 'pending',
    submittedAt: new Date()
  };

  if (!timeOffRequests.has(requestData.employeeId)) {
    timeOffRequests.set(requestData.employeeId, []);
  }
  timeOffRequests.get(requestData.employeeId)!.push(request);

  return request;
}

async function approveTimeOffRequest(requestId: string, approverId: string): Promise<boolean> {
  // Find and approve the request
  for (const [employeeId, requests] of timeOffRequests.entries()) {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      request.status = 'approved';
      request.approvedAt = new Date();
      request.approvedBy = approverId;
      return true;
    }
  }
  return false;
}

async function generateDepartmentSchedule(scheduleData: any): Promise<any> {
  const { department, startDate, endDate, requirements } = scheduleData;

  // Use scheduling algorithm to generate optimal schedule
  const employees = workforceManagementEngine.getEmployees({ department });
  const schedule = generateOptimalSchedule(employees, new Date(startDate), new Date(endDate), requirements);

  return {
    department,
    period: { start: startDate, end: endDate },
    schedule,
    generatedAt: new Date()
  };
}

async function updateEmployeeAvailability(employeeId: string, availability: any): Promise<boolean> {
  // Update employee availability preferences
  const employee = workforceManagementEngine.getEmployee(employeeId);
  if (!employee) return false;

  // Update work schedule based on availability
  employee.workSchedule = { ...employee.workSchedule, ...availability };
  employee.updatedAt = new Date();

  return true;
}

async function updateShift(shiftId: string, updates: any): Promise<Shift | null> {
  // Find and update shift
  for (const [department, deptShifts] of shifts.entries()) {
    const shiftIndex = deptShifts.findIndex(s => s.name === shiftId);
    if (shiftIndex !== -1) {
      deptShifts[shiftIndex] = { ...deptShifts[shiftIndex], ...updates };
      return deptShifts[shiftIndex];
    }
  }
  return null;
}

async function swapEmployeeShifts(employeeId1: string, employeeId2: string, date: Date): Promise<boolean> {
  // Find shifts for both employees on the given date and swap them
  const employee1Assignments = schedules.get(employeeId1) || [];
  const employee2Assignments = schedules.get(employeeId2) || [];

  const employee1Shift = employee1Assignments.find((a: any) => a.date.toDateString() === date.toDateString());
  const employee2Shift = employee2Assignments.find((a: any) => a.date.toDateString() === date.toDateString());

  if (!employee1Shift || !employee2Shift) return false;

  // Swap the shifts
  const tempShift = employee1Shift.shiftId;
  employee1Shift.shiftId = employee2Shift.shiftId;
  employee2Shift.shiftId = tempShift;

  return true;
}

async function deleteShift(shiftId: string): Promise<boolean> {
  for (const [department, deptShifts] of shifts.entries()) {
    const shiftIndex = deptShifts.findIndex(s => s.name === shiftId);
    if (shiftIndex !== -1) {
      deptShifts.splice(shiftIndex, 1);
      return true;
    }
  }
  return false;
}

async function removeShiftAssignment(assignmentId: string): Promise<boolean> {
  for (const [employeeId, assignments] of schedules.entries()) {
    const assignmentIndex = assignments.findIndex((a: any) => a.id === assignmentId);
    if (assignmentIndex !== -1) {
      assignments.splice(assignmentIndex, 1);
      return true;
    }
  }
  return false;
}

// Utility functions
function datesOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 <= end2 && start2 <= end1;
}

function calculateTotalScheduledHours(employees: any[]): number {
  return employees.reduce((total: number, employee: any) => {
    return total + employee.assignments.reduce((empTotal: number, assignment: any) => {
      // Simplified hour calculation
      return empTotal + 8; // Assume 8 hours per shift
    }, 0);
  }, 0);
}

function identifyCoverageGaps(departmentSchedule: any[]): any[] {
  // Identify time periods with insufficient coverage
  const gaps: any[] = [];

  // Simplified gap detection
  const requiredCoverage = 2; // Minimum employees per shift

  departmentSchedule.forEach(employee => {
    employee.assignments.forEach((assignment: any) => {
      // Check if coverage is below minimum
      if (assignment.coverage < requiredCoverage) {
        gaps.push({
          date: assignment.date,
          shift: assignment.shiftId,
          required: requiredCoverage,
          actual: assignment.coverage,
          severity: assignment.coverage === 0 ? 'critical' : 'warning'
        });
      }
    });
  });

  return gaps;
}

function calculateOvertimeHours(employees: any[]): number {
  return employees.reduce((total: number, employee: any) => {
    return total + (employee.overtimeHours || 0);
  }, 0);
}

function calculateUtilizationRate(employees: any[]): number {
  const totalCapacity = employees.length * 40; // Assume 40 hours per week per employee
  const scheduledHours = calculateTotalScheduledHours(employees);

  return totalCapacity > 0 ? (scheduledHours / totalCapacity) * 100 : 0;
}

function generateOptimalSchedule(employees: Employee[], start: Date, end: Date, requirements: any): any {
  // Use scheduling algorithm to create optimal schedule
  // This is a simplified implementation - production would use more sophisticated algorithms

  const schedule = {
    period: { start, end },
    assignments: [] as any[],
    coverage: {} as Record<string, number>,
    conflicts: [] as any[]
  };

  // Simple round-robin scheduling
  let employeeIndex = 0;
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();

    // Only schedule work days
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // Skip weekends

    const availableEmployees = employees.filter(emp =>
      emp.employmentStatus === 'active' &&
      emp.workSchedule.workDays.includes(dayOfWeek)
    );

    if (availableEmployees.length > 0) {
      const employee = availableEmployees[employeeIndex % availableEmployees.length];
      schedule.assignments.push({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: new Date(date),
        shift: 'standard', // 9-5 shift
        department: employee.department
      });

      employeeIndex++;
    }
  }

  return schedule;
}

function generateSchedulingRecommendations(departmentSchedule: any): string[] {
  const recommendations = [];
  const coverageGaps = identifyCoverageGaps(departmentSchedule);
  const utilizationRate = calculateUtilizationRate(departmentSchedule);

  if (coverageGaps.length > 0) {
    recommendations.push(`Address ${coverageGaps.length} scheduling gaps to ensure adequate coverage`);
  }

  if (utilizationRate > 90) {
    recommendations.push('High utilization rate detected - consider hiring additional staff');
  } else if (utilizationRate < 60) {
    recommendations.push('Low utilization rate - review scheduling efficiency');
  }

  if (recommendations.length === 0) {
    recommendations.push('Schedule appears optimal - continue monitoring regularly');
  }

  return recommendations;
}