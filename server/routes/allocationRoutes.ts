import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { allocationService } from "../services/allocation-service";

const router = Router();

// Create a new faculty-student allocation
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "admin" && req.user.role !== "faculty") return res.sendStatus(403);

  try {
    const { facultyId, studentId } = req.body;
    if (!facultyId || !studentId) {
      return res.status(400).json({ message: "Faculty ID and Student ID are required" });
    }

    // Create the allocation
    const allocation = await storage.createAllocation({
      facultyId: parseInt(facultyId),
      studentId: parseInt(studentId),
    });

    res.json(allocation);
  } catch (error) {
    console.error("Allocation creation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get allocations
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    // Get base allocations
    const allocations = await storage.getAllocations(req.user.id, req.user.role);

    // If there are allocations, fetch student details for each allocation
    if (allocations.length > 0) {
      const allocationsWithStudentInfo = await Promise.all(
        allocations.map(async (allocation) => {
          const student = await storage.getUser(allocation.studentId);
          return {
            ...allocation,
            student: student ? {
              id: student.id,
              name: student.name,
              email: student.email,
              department: student.department
            } : null
          };
        })
      );
      res.json(allocationsWithStudentInfo);
    } else {
      res.json(allocations);
    }
  } catch (error) {
    console.error("Get allocations error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Auto-allocate a specific student
router.post("/auto-allocate/:studentId", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty") return res.sendStatus(403);

  try {
    const studentId = parseInt(req.params.studentId);
    if (isNaN(studentId)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const allocation = await allocationService.allocateStudent(studentId);
    
    if (!allocation) {
      return res.status(400).json({ 
        message: "Could not allocate student. All faculty members may be at maximum capacity." 
      });
    }

    res.json({ 
      success: true, 
      message: "Student allocated successfully", 
      allocation 
    });
  } catch (error) {
    console.error("Auto allocation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get unallocated students
router.get("/unallocated-students", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const students = await allocationService.getUnallocatedStudents();
    res.json(students);
  } catch (error) {
    console.error("Get unallocated students error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Bulk auto-allocate all unallocated students
router.post("/bulk-allocate", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const result = await allocationService.bulkAllocateStudents();
    res.json({
      success: true,
      message: `Successfully allocated ${result.success} students. Failed to allocate ${result.failed} students.`,
      result
    });
  } catch (error) {
    console.error("Bulk allocation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get faculty workloads
router.get("/faculty-workloads", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  if (req.user.role !== "faculty" && req.user.role !== "admin") return res.sendStatus(403);

  try {
    const workloads = await allocationService.getFacultyWorkloads();
    res.json(workloads);
  } catch (error) {
    console.error("Get faculty workloads error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router; 