import { baseApi } from "./base-api";

export interface PortfolioProject {
  _id: string;
  title: string;
  slug: string;
  description: string;
  techStack: string[];
  image: string;
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
  status: "draft" | "published";
  order: number;
}

interface ProjectsResponse {
  success: boolean;
  data: PortfolioProject[];
}

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<PortfolioProject[], void>({
      query: () => "/projects",
      transformResponse: (response: ProjectsResponse) => response.data,
      providesTags: ["Projects"],
    }),
  }),
});

export const { useGetProjectsQuery } = projectsApi;