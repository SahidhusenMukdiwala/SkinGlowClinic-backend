import { Op } from 'sequelize';
import { Blog } from '../models/index.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

const DEFAULT_BLOG_COVER = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80';

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Public: Get published blogs with pagination and search
 */
export const getPublishedBlogs = async ({ page = 1, limit = 9, search } = {}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 9));
  const offset = (pageNum - 1) * limitNum;

  const where = { is_published: 1 };

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { content: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Blog.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'title', 'slug', 'content', 'cover_image', 'createdAt'],
  });

  return {
    blogs: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Public: Get single blog post by slug with adjacent recommendations
 */
export const getBlogBySlug = async (slug) => {
  const blog = await Blog.findOne({
    where: {
      slug,
      is_published: 1,
    },
  });

  if (!blog) {
    return null;
  }

  // Recent 3 other articles
  const recentBlogs = await Blog.findAll({
    where: {
      id: { [Op.ne]: blog.id },
      is_published: 1,
    },
    limit: 3,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'title', 'slug', 'cover_image', 'createdAt'],
  });

  return {
    blog,
    related: recentBlogs,
  };
};

/**
 * Admin: Get paginated blogs with publish status filter and search
 */
export const getAdminBlogs = async ({
  page = 1,
  limit = 10,
  search,
  is_published,
}) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (is_published !== undefined && is_published !== null && is_published !== '' && is_published !== 'all') {
    where.is_published = parseInt(is_published, 10);
  }

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { slug: { [Op.like]: term } },
      { content: { [Op.like]: term } },
    ];
  }

  const { count, rows } = await Blog.findAndCountAll({
    where,
    limit: limitNum,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    blogs: rows,
    total: count,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    limit: limitNum,
  };
};

/**
 * Admin: Get single blog by ID
 */
export const getBlogById = async (id) => {
  const blog = await Blog.findByPk(id);
  if (!blog) {
    const error = new Error(`Blog post not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }
  return blog;
};

/**
 * Admin: Create a new blog post
 */
export const createBlog = async (data, file) => {
  let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.title);

  // Check unique slug
  const existingWithSlug = await Blog.findOne({ where: { slug } });
  if (existingWithSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  let coverImage = data.cover_image || DEFAULT_BLOG_COVER;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/blogs');
    coverImage = uploadResult.secure_url;
  }

  const blog = await Blog.create({
    title: data.title.trim(),
    slug,
    content: data.content.trim(),
    cover_image: coverImage,
    is_published: data.is_published !== undefined ? parseInt(data.is_published, 10) : 1,
  });

  return blog;
};

/**
 * Admin: Update blog post
 */
export const updateBlog = async (id, data, file) => {
  const blog = await Blog.findByPk(id);
  if (!blog) {
    const error = new Error(`Blog post not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  let slug = blog.slug;
  if (data.slug && data.slug !== blog.slug) {
    slug = generateSlug(data.slug);
    const existingWithSlug = await Blog.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
      },
    });
    if (existingWithSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
  }

  let coverImage = blog.cover_image;
  if (file && file.buffer) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'skinglowclinic/blogs');
    coverImage = uploadResult.secure_url;
  } else if (data.cover_image !== undefined && data.cover_image.trim()) {
    coverImage = data.cover_image.trim();
  }

  await blog.update({
    title: data.title !== undefined ? data.title.trim() : blog.title,
    slug,
    content: data.content !== undefined ? data.content.trim() : blog.content,
    cover_image: coverImage,
    is_published: data.is_published !== undefined ? parseInt(data.is_published, 10) : blog.is_published,
  });

  return blog;
};

/**
 * Admin: Delete blog post
 */
export const deleteBlog = async (id) => {
  const blog = await Blog.findByPk(id);
  if (!blog) {
    const error = new Error(`Blog post not found with ID: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  await blog.destroy();
  return {
    id: parseInt(id, 10),
    message: 'Blog post deleted successfully',
  };
};
