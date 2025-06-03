/**
 * Get Projects Use Case
 *
 * Business logic for retrieving JIRA projects with filtering capabilities
 */

import { JiraApiError } from "@features/jira/client/errors";
import type { ProjectRepository } from "../repositories";
import type {
  GetProjectsOptions,
  Project,
} from "../repositories/project.types";

/**
 * Request parameters for get projects use case
 */
export interface GetProjectsUseCaseRequest {
  expand?: string[];
  recent?: number;
  properties?: string[];
  maxResults?: number;
  startAt?: number;
  typeKey?: string;
  categoryId?: number;
  searchQuery?: string;
  orderBy?: string;
}

/**
 * Interface for get projects use case
 */
export interface GetProjectsUseCase {
  /**
   * Execute the get projects use case
   *
   * @param request - Projects retrieval parameters
   * @returns List of JIRA projects matching the criteria
   */
  execute(request: GetProjectsUseCaseRequest): Promise<Project[]>;
}

/**
 * Implementation of the get projects use case
 */
export class GetProjectsUseCaseImpl implements GetProjectsUseCase {
  /**
   * Create a new GetProjectsUseCase implementation
   *
   * @param projectRepository - Repository for project operations
   */
  constructor(private readonly projectRepository: ProjectRepository) {}

  /**
   * Execute the get projects use case
   *
   * @param request - Projects retrieval parameters
   * @returns List of JIRA projects matching the criteria
   */
  public async execute(request: GetProjectsUseCaseRequest): Promise<Project[]> {
    try {
      // Transform request to repository options
      const options = this.transformToOptions(request);

      // Get projects using repository with provided parameters
      return await this.projectRepository.getProjects(options);
    } catch (error) {
      // Rethrow with better context if needed
      // TODO: Use case must have specific errors
      if (error instanceof Error) {
        throw JiraApiError.withStatusCode(`Failed to get projects: ${error.message}`, 400);
      }
      throw error;
    }
  }

  /**
   * Transform use case request to repository options
   */
  private transformToOptions(
    request: GetProjectsUseCaseRequest,
  ): GetProjectsOptions {
    const options: GetProjectsOptions = {};

    if (request.maxResults) options.maxResults = request.maxResults;
    if (request.startAt) options.startAt = request.startAt;
    if (request.searchQuery) options.searchQuery = request.searchQuery;
    if (request.typeKey) options.typeKey = request.typeKey;
    if (request.categoryId) options.categoryId = request.categoryId;
    if (request.recent) options.recent = request.recent;
    if (request.orderBy) options.orderBy = request.orderBy;
    if (request.expand) options.expand = request.expand;
    if (request.properties) options.properties = request.properties;

    return options;
  }
}
