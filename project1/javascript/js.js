const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.2, rootMargin: '0px 0px -100px' }
);
document.querySelectorAll('.last').forEach((el) => io.observe(el));
