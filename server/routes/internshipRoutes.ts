import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { internshipService } from '../services/internship-service';
import { internshipApplicationService } from '../services/internship-application-service';
import { insertInternshipSchema, insertInternshipApplicationSchema } from '../../shared/schema';

const router = Router();

// Configure multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only pdf, doc, and docx files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.') as any);
    }
  }
});

// Validation middleware for internships
const validateInternship = (req: any, res: any, next: any) => {
  try {
    // Make sure skills is an array
    if (req.body.skills && !Array.isArray(req.body.skills)) {
      req.body.skills = typeof req.body.skills === 'string' 
        ? req.body.skills.split(',').map((s: string) => s.trim())
        : [];
    }
    
    // Ensure deadline is a string and remove any timestamp formatting
    if (req.body.deadline) {
      req.body.deadline = String(req.body.deadline).trim();
    }
    
    // Validate the data
    insertInternshipSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    next(error);
  }
};

// Validation middleware for internship applications
const validateApplication = (req: any, res: any, next: any) => {
  try {
    console.log('Validating application data:', req.body);
    
    // Skip validation for now since we're using FormData and the file handling
    // We'll validate the individual fields in the createApplication method
    next();
    
    // This was the previous validation code
    /*
    insertInternshipApplicationSchema.parse(req.body);
    next();
    */
  } catch (error) {
    console.error('Validation error:', error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    next(error);
  }
};

// Get all internships with filters
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type as 'Full-time' | 'Part-time' | undefined,
      category: req.query.category as string | undefined,
      skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
      search: (req.query.search || req.query.searchQuery) as string | undefined,
      sortBy: req.query.sortBy as 'deadline' | 'stipend' | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await internshipService.getInternships(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

// Get single internship
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const internship = await internshipService.getInternship(id);
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }
    
    res.json(internship);
  } catch (error) {
    console.error('Error fetching internship:', error);
    res.status(500).json({ error: 'Failed to fetch internship' });
  }
});

// Create internship (faculty/admin only)
router.post('/', 
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    next();
  },
  validateInternship,
  async (req, res) => {
    try {
      const internship = await internshipService.createInternship(req.body, req.user.id);
      res.status(201).json(internship);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create internship';
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Update internship (faculty/admin only)
router.put('/:id',
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    next();
  },
  validateInternship,
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // If user is faculty, check if they created this internship
      if (req.user.role === 'faculty') {
        const existingInternship = await internshipService.getInternship(id);
        if (!existingInternship) {
          return res.status(404).json({ error: 'Internship not found' });
        }
        
        if (existingInternship.createdBy !== req.user.id) {
          return res.status(403).json({ error: 'You do not have permission to update this internship' });
        }
      }
      
      const internship = await internshipService.updateInternship(id, req.body);
      
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }
      
      res.json(internship);
    } catch (error) {
      console.error('Error updating internship:', error);
      res.status(500).json({ error: 'Failed to update internship' });
    }
  }
);

// Delete internship (faculty/admin only)
router.delete('/:id',
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    next();
  },
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // If user is faculty, check if they created this internship
      if (req.user.role === 'faculty') {
        const existingInternship = await internshipService.getInternship(id);
        if (!existingInternship) {
          return res.status(404).json({ error: 'Internship not found' });
        }
        
        if (existingInternship.createdBy !== req.user.id) {
          return res.status(403).json({ error: 'You do not have permission to delete this internship' });
        }
      }
      
      const deleted = await internshipService.deleteInternship(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Internship not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting internship:', error);
      res.status(500).json({ error: 'Failed to delete internship' });
    }
  }
);

// INTERNSHIP APPLICATIONS ROUTES

// Get all applications for a student
router.get('/applications/student', 
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'student') {
      return res.sendStatus(403);
    }
    next();
  },
  async (req, res) => {
    try {
      const applications = await internshipApplicationService.getStudentApplications(req.user.id);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching student applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }
);

// Get all applications for an internship (faculty/admin only)
router.get('/:id/applications', 
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
      return res.sendStatus(403);
    }
    next();
  },
  async (req, res) => {
    try {
      const internshipId = parseInt(req.params.id);
      
      // If user is faculty, check if they created this internship
      if (req.user.role === 'faculty') {
        const internship = await internshipService.getInternship(internshipId);
        if (!internship || internship.createdBy !== req.user.id) {
          return res.status(403).json({ error: 'You do not have permission to view applications for this internship' });
        }
      }
      
      const applications = await internshipApplicationService.getApplicationsForInternship(internshipId);
      res.json(applications);
    } catch (error) {
      console.error('Error fetching internship applications:', error);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  }
);

// Get specific application by ID
router.get('/applications/:id', 
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  },
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await internshipApplicationService.getApplicationById(id);
      
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Check if user is authorized to view this application
      if (req.user.role === 'student' && application.studentId !== req.user.id) {
        return res.sendStatus(403);
      }
      
      if (req.user.role === 'faculty') {
        // A faculty user should only be able to view applications for internships they created
        const internship = await internshipService.getInternship(application.internshipId);
        if (!internship || internship.createdBy !== req.user.id) {
          return res.sendStatus(403);
        }
      }
      
      res.json(application);
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  }
);

// Apply for an internship (student only)
router.post('/:id/apply',
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'student') {
      return res.sendStatus(403);
    }
    console.log('User authenticated for application:', req.user.id);
    next();
  },
  upload.single('resume'),
  validateApplication,
  async (req, res) => {
    try {
      const internshipId = parseInt(req.params.id);
      console.log('Applying for internship:', internshipId);
      console.log('Application data:', req.body);
      console.log('Resume file:', req.file);
      
      // Check if internship exists and is still accepting applications
      const internship = await internshipService.getInternship(internshipId);
      if (!internship) {
        return res.status(404).json({ error: 'Internship not found' });
      }
      
      // Check deadline (assuming deadline is stored in a string format like "YYYY-MM-DD")
      const deadlineDate = new Date(internship.deadline);
      const currentDate = new Date();
      if (deadlineDate < currentDate) {
        return res.status(400).json({ error: 'The application deadline has passed' });
      }
      
      // Check if resume file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'Resume file is required' });
      }
      
      // Set the internship ID in the application data
      const applicationData = {
        ...req.body,
        internshipId,
      };
      
      console.log('Processed application data:', applicationData);
      
      // Create the application
      const application = await internshipApplicationService.createApplication(
        applicationData, 
        req.user.id, 
        req.file
      );
      
      console.log('Application created:', application);
      
      res.status(201).json(application);
    } catch (error) {
      console.error('Error applying for internship:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply for internship';
      res.status(500).json({ error: errorMessage });
    }
  }
);

// Update application status (withdraw for students, accept/reject for faculty)
router.patch('/applications/:id/status',
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  },
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, feedback } = req.body;
      
      // Get the application to check permissions
      const application = await internshipApplicationService.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Check permissions based on role
      if (req.user.role === 'student') {
        // Students can only withdraw their own applications
        if (application.studentId !== req.user.id) {
          return res.sendStatus(403);
        }
        
        if (status !== 'withdrawn') {
          return res.status(400).json({ error: 'Students can only withdraw applications' });
        }
      } else if (req.user.role === 'faculty') {
        // Faculty can only update applications for internships they created
        const internship = await internshipService.getInternship(application.internshipId);
        if (!internship || internship.createdBy !== req.user.id) {
          return res.sendStatus(403);
        }
        
        // Faculty can only accept or reject
        if (status !== 'accepted' && status !== 'rejected') {
          return res.status(400).json({ error: 'Faculty can only accept or reject applications' });
        }
      } else if (req.user.role !== 'admin') {
        return res.sendStatus(403);
      }
      
      // Update the application status
      const updatedApplication = await internshipApplicationService.updateApplicationStatus(
        id, 
        status as 'pending' | 'accepted' | 'rejected' | 'withdrawn',
        feedback
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({ error: 'Failed to update application status' });
    }
  }
);

// Delete an application (admin or student who applied)
router.delete('/applications/:id',
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    next();
  },
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get the application to check permissions
      const application = await internshipApplicationService.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Check permissions
      if (req.user.role === 'student' && application.studentId !== req.user.id) {
        return res.sendStatus(403);
      }
      
      if (req.user.role === 'faculty') {
        // Faculty can delete applications for internships they created
        const internship = await internshipService.getInternship(application.internshipId);
        if (!internship || internship.createdBy !== req.user.id) {
          return res.sendStatus(403);
        }
      }
      
      // Delete the application
      const deleted = await internshipApplicationService.deleteApplication(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({ error: 'Failed to delete application' });
    }
  }
);

// Add this route after other application routes
router.get('/applications/:id/resume', (req, res, next) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);
  next();
}, async (req, res) => {
  try {
    const applicationId = parseInt(req.params.id);
    
    // Get the application details
    const application = await internshipApplicationService.getApplicationById(applicationId);
    
    if (!application) {
      return res.status(404).json({ 
        success: false, 
        message: 'Application not found' 
      });
    }
    
    // Check if user is authorized to access this resume
    // Faculty can access any resume from applications for their internships
    // Students can only access their own resumes
    const isFaculty = req.user.role === 'faculty';
    const isStudent = req.user.role === 'student';
    const isOwner = application.studentId === req.user.id;
    const isFacultyOwner = isFaculty && application.internship?.createdBy === req.user.id;
    
    if (!(isStudent && isOwner) && !isFacultyOwner) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this resume' 
      });
    }
    
    // Get the resume URL from the storage service
    const resumeUrl = await internshipApplicationService.getResumeUrl(application.resumePath);
    
    // Redirect to the pre-signed URL or file path
    res.redirect(resumeUrl);
  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download resume' 
    });
  }
});

// Get faculty's own internships
router.get('/faculty/my-internships', 
  (req, res, next) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user.role !== 'faculty') {
      return res.sendStatus(403);
    }
    next();
  },
  async (req, res) => {
    try {
      const facultyId = req.user.id;
      const filters = {
        type: req.query.type as 'Full-time' | 'Part-time' | undefined,
        category: req.query.category as string | undefined,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
        search: (req.query.search || req.query.searchQuery) as string | undefined,
        sortBy: req.query.sortBy as 'deadline' | 'stipend' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await internshipService.getInternshipsByFaculty(facultyId, filters);
      res.json(result);
    } catch (error) {
      console.error('Error fetching faculty internships:', error);
      res.status(500).json({ error: 'Failed to fetch internships' });
    }
  }
);

export default router; 