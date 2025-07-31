import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, fetchProjectById } from '../store/slices/projectSlice';

export const useProjects = (params = {}) => {
  const dispatch = useDispatch();
  const { projects, loading, error, totalPages } = useSelector(state => state.projects);

  useEffect(() => {
    dispatch(fetchProjects(params));
  }, [dispatch, params]);

  return { projects, loading, error, totalPages };
};

export const useProject = (projectId) => {
  const dispatch = useDispatch();
  const { currentProject, loading, error } = useSelector(state => state.projects);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  return { project: currentProject, loading, error };
};