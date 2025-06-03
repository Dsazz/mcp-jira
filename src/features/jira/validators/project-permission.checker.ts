import { logger } from "@core/logging";
import type { HttpClient } from "@features/jira/client/http/jira.http.types";
import type { ProjectPermissions } from "../repositories/project.types";

/**
 * TODO: Wrong filename or directory?
 * Permission checker interface for project operations
 * Clear responsibility: verifying user permissions for project operations
 */
export interface ProjectPermissionChecker {
  getProjectPermissions(projectKey: string): Promise<ProjectPermissions>;
  hasCreateIssuePermission(projectKey: string): Promise<boolean>;
  hasEditIssuePermission(projectKey: string): Promise<boolean>;
  hasDeleteIssuePermission(projectKey: string): Promise<boolean>;
}

/**
 * Implementation of ProjectPermissionChecker
 * Extracted from JiraClient god object - permission verification operations only
 */
export class ProjectPermissionCheckerImpl implements ProjectPermissionChecker {
  private readonly logger = logger;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get all permissions for a project
   */
  async getProjectPermissions(projectKey: string): Promise<ProjectPermissions> {
    this.logger.debug(`Getting permissions for project: ${projectKey}`, {
      prefix: "JIRA:ProjectPermissionChecker",
    });

    const permissions = await this.httpClient.sendRequest<ProjectPermissions>({
      endpoint: "user/permission/search",
      method: "GET",
      queryParams: {
        projectKey,
      },
    });

    this.logger.debug("Retrieved project permissions", {
      prefix: "JIRA:ProjectPermissionChecker",
      projectKey,
      permissionCount: Object.keys(permissions.permissions || {}).length,
    });

    return permissions;
  }

  /**
   * Check if user has CREATE_ISSUES permission for the project
   */
  async hasCreateIssuePermission(projectKey: string): Promise<boolean> {
    this.logger.debug("Checking CREATE_ISSUES permission", {
      prefix: "JIRA:ProjectPermissionChecker",
      projectKey,
    });

    try {
      const permissions = await this.getProjectPermissions(projectKey);
      const hasPermission =
        permissions.permissions?.CREATE_ISSUES?.havePermission ?? false;

      this.logger.debug("CREATE_ISSUES permission check result", {
        prefix: "JIRA:ProjectPermissionChecker",
        projectKey,
        hasPermission,
      });

      return hasPermission;
    } catch (error) {
      this.logger.error("Failed to check CREATE_ISSUES permission", {
        prefix: "JIRA:ProjectPermissionChecker",
        projectKey,
        error,
      });
      return false;
    }
  }

  /**
   * Check if user has EDIT_ISSUES permission for the project
   */
  async hasEditIssuePermission(projectKey: string): Promise<boolean> {
    this.logger.debug("Checking EDIT_ISSUES permission", {
      prefix: "JIRA:ProjectPermissionChecker",
      projectKey,
    });

    try {
      const permissions = await this.getProjectPermissions(projectKey);
      const hasPermission =
        permissions.permissions?.EDIT_ISSUES?.havePermission ?? false;

      this.logger.debug("EDIT_ISSUES permission check result", {
        prefix: "JIRA:ProjectPermissionChecker",
        projectKey,
        hasPermission,
      });

      return hasPermission;
    } catch (error) {
      this.logger.error("Failed to check EDIT_ISSUES permission", {
        prefix: "JIRA:ProjectPermissionChecker",
        projectKey,
        error,
      });
      return false;
    }
  }

  /**
   * Check if user has DELETE_ISSUES permission for the project
   */
  async hasDeleteIssuePermission(projectKey: string): Promise<boolean> {
    this.logger.debug("Checking DELETE_ISSUES permission", {
      prefix: "JIRA:ProjectPermissionChecker",
      projectKey,
    });

    try {
      const permissions = await this.getProjectPermissions(projectKey);
      const hasPermission =
        permissions.permissions?.DELETE_ISSUES?.havePermission ?? false;

      this.logger.debug(
        `DELETE_ISSUES permission check result: ${hasPermission}`,
        {
          prefix: "JIRA:ProjectPermissionChecker",
          projectKey,
        },
      );

      return hasPermission;
    } catch (error) {
      this.logger.error(
        `Failed to check DELETE_ISSUES permission for project: ${projectKey}`,
        {
          prefix: "JIRA:ProjectPermissionChecker",
          error,
        },
      );
      return false;
    }
  }
}
