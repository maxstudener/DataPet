module ApplicationHelper

  def target_blank?
    request.url.match(/(database_relations|databases)/) ? '' : 'target=_blank'
  end

end