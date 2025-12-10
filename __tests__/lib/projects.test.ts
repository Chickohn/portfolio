/**
 * Unit tests for projects data and utilities
 */

import { getProjectById, getAllProjectIds, projects } from '@/lib/projects';

describe('Projects data', () => {
  it('should have at least one project', () => {
    expect(projects.length).toBeGreaterThan(0);
  });

  it('should have valid project structure', () => {
    projects.forEach(project => {
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('title');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('category');
      expect(project).toHaveProperty('technologies');
      expect(project).toHaveProperty('sections');
      expect(typeof project.id).toBe('string');
      expect(typeof project.title).toBe('string');
      expect(Array.isArray(project.technologies)).toBe(true);
      expect(Array.isArray(project.sections)).toBe(true);
    });
  });
});

describe('getProjectById', () => {
  it('should return project when id exists', () => {
    const project = getProjectById(projects[0].id);
    expect(project).toBeDefined();
    expect(project?.id).toBe(projects[0].id);
  });

  it('should return undefined when id does not exist', () => {
    const project = getProjectById('non-existent-id');
    expect(project).toBeUndefined();
  });
});

describe('getAllProjectIds', () => {
  it('should return array of project ids', () => {
    const ids = getAllProjectIds();
    expect(Array.isArray(ids)).toBe(true);
    expect(ids.length).toBe(projects.length);
  });

  it('should return unique ids', () => {
    const ids = getAllProjectIds();
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

