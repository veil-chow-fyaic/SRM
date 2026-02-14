-- Make supplier update RPC resilient to legacy enum values and empty-string payloads.
CREATE OR REPLACE FUNCTION public.update_supplier_with_log(
  p_supplier_id UUID,
  p_updates JSONB,
  p_change_type VARCHAR DEFAULT 'basic',
  p_change_title VARCHAR DEFAULT '供应商信息更新',
  p_change_description TEXT DEFAULT NULL,
  p_author_id UUID DEFAULT NULL,
  p_author_name VARCHAR DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_changed_fields TEXT[] := '{}';
  v_field TEXT;
  v_old_value JSONB;
  v_new_value JSONB;
  v_log_id UUID;
  v_updates JSONB := COALESCE(p_updates, '{}'::jsonb);
  v_financial_interval TEXT;
  v_financial_anchor TEXT;
  v_evaluation_period TEXT;
  v_financial_period INTEGER;
  v_system_score NUMERIC;
  v_portal_demand_broadcast BOOLEAN;
  v_portal_empowerment_center BOOLEAN;
  v_portal_ticket_system BOOLEAN;
  v_portal_performance_view BOOLEAN;
  v_tags TEXT[];
  v_scarce_resources TEXT[];
BEGIN
  SELECT to_jsonb(s.*) INTO v_old_data
  FROM suppliers s
  WHERE s.id = p_supplier_id;

  IF v_old_data IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Supplier not found');
  END IF;

  v_financial_interval := NULLIF(trim(v_updates->>'financial_interval'), '');
  IF v_financial_interval IS NOT NULL THEN
    v_financial_interval := CASE lower(replace(v_financial_interval, '-', '_'))
      WHEN 'semimonthly' THEN 'semi_monthly'
      WHEN 'semi_monthly' THEN 'semi_monthly'
      WHEN 'ticket' THEN 'per_shipment'
      WHEN 'per_shipment' THEN 'per_shipment'
      WHEN 'monthly' THEN 'monthly'
      WHEN 'weekly' THEN 'weekly'
      ELSE lower(replace(v_financial_interval, '-', '_'))
    END;
  END IF;

  v_financial_anchor := NULLIF(trim(v_updates->>'financial_anchor'), '');
  IF v_financial_anchor IS NOT NULL THEN
    v_financial_anchor := CASE lower(replace(replace(v_financial_anchor, '-', '_'), ' ', '_'))
      WHEN 'etd' THEN 'etd'
      WHEN 'eta' THEN 'eta'
      WHEN 'gate_in' THEN 'gate_in'
      WHEN 'invoice' THEN 'invoice_date'
      WHEN 'invoice_date' THEN 'invoice_date'
      ELSE lower(replace(replace(v_financial_anchor, '-', '_'), ' ', '_'))
    END;
  END IF;

  v_evaluation_period := NULLIF(trim(v_updates->>'evaluation_period'), '');
  IF v_evaluation_period IS NOT NULL THEN
    v_evaluation_period := CASE lower(replace(v_evaluation_period, '-', '_'))
      WHEN 'semiannual' THEN 'annual'
      WHEN 'semi_annual' THEN 'annual'
      ELSE lower(replace(v_evaluation_period, '-', '_'))
    END;
  END IF;

  IF NULLIF(trim(v_updates->>'financial_period'), '') ~ '^-?\d+$' THEN
    v_financial_period := (v_updates->>'financial_period')::INTEGER;
  END IF;

  IF NULLIF(trim(v_updates->>'system_score'), '') ~ '^-?\d+(\.\d+)?$' THEN
    v_system_score := (v_updates->>'system_score')::NUMERIC;
  END IF;

  IF lower(NULLIF(trim(v_updates->>'portal_demand_broadcast'), '')) IN ('true', 'false') THEN
    v_portal_demand_broadcast := (v_updates->>'portal_demand_broadcast')::BOOLEAN;
  END IF;
  IF lower(NULLIF(trim(v_updates->>'portal_empowerment_center'), '')) IN ('true', 'false') THEN
    v_portal_empowerment_center := (v_updates->>'portal_empowerment_center')::BOOLEAN;
  END IF;
  IF lower(NULLIF(trim(v_updates->>'portal_ticket_system'), '')) IN ('true', 'false') THEN
    v_portal_ticket_system := (v_updates->>'portal_ticket_system')::BOOLEAN;
  END IF;
  IF lower(NULLIF(trim(v_updates->>'portal_performance_view'), '')) IN ('true', 'false') THEN
    v_portal_performance_view := (v_updates->>'portal_performance_view')::BOOLEAN;
  END IF;

  IF jsonb_typeof(v_updates->'tags') = 'array' THEN
    v_tags := ARRAY(SELECT jsonb_array_elements_text(v_updates->'tags'));
  END IF;
  IF jsonb_typeof(v_updates->'scarce_resources') = 'array' THEN
    v_scarce_resources := ARRAY(SELECT jsonb_array_elements_text(v_updates->'scarce_resources'));
  END IF;

  UPDATE suppliers
  SET
    name = COALESCE(NULLIF(v_updates->>'name', ''), name),
    code = COALESCE(NULLIF(v_updates->>'code', ''), code),
    local_name = COALESCE(v_updates->>'local_name', local_name),
    logo_text = COALESCE(v_updates->>'logo_text', logo_text),
    tier = COALESCE(NULLIF(v_updates->>'tier', ''), tier),
    status = COALESCE(NULLIF(v_updates->>'status', ''), status),
    stage = COALESCE(v_updates->>'stage', stage),
    category = COALESCE(v_updates->>'category', category),
    location = COALESCE(v_updates->>'location', location),
    address = COALESCE(v_updates->>'address', address),
    contact_phone = COALESCE(v_updates->>'contact_phone', contact_phone),
    website = COALESCE(v_updates->>'website', website),
    structure = COALESCE(v_updates->>'structure', structure),
    financial_interval = COALESCE(v_financial_interval, financial_interval),
    financial_anchor = COALESCE(v_financial_anchor, financial_anchor),
    financial_period = COALESCE(v_financial_period, financial_period),
    system_score = COALESCE(v_system_score, system_score),
    evaluation_period = COALESCE(v_evaluation_period, evaluation_period),
    portal_demand_broadcast = COALESCE(v_portal_demand_broadcast, portal_demand_broadcast),
    portal_empowerment_center = COALESCE(v_portal_empowerment_center, portal_empowerment_center),
    portal_ticket_system = COALESCE(v_portal_ticket_system, portal_ticket_system),
    portal_performance_view = COALESCE(v_portal_performance_view, portal_performance_view),
    tags = COALESCE(v_tags, tags),
    scarce_resources = COALESCE(v_scarce_resources, scarce_resources),
    notes = COALESCE(v_updates->>'notes', notes),
    updated_at = NOW()
  WHERE id = p_supplier_id
  RETURNING to_jsonb(suppliers.*) INTO v_new_data;

  FOR v_field IN SELECT jsonb_object_keys(v_old_data) LOOP
    v_old_value := v_old_data->v_field;
    v_new_value := v_new_data->v_field;
    IF v_old_value IS DISTINCT FROM v_new_value AND v_field NOT IN ('updated_at', 'created_at') THEN
      v_changed_fields := array_append(v_changed_fields, v_field);
    END IF;
  END LOOP;

  IF array_length(v_changed_fields, 1) > 0 THEN
    INSERT INTO supplier_change_logs (
      supplier_id,
      change_type,
      change_title,
      change_description,
      old_value,
      new_value,
      changed_fields,
      author_id,
      author_name
    ) VALUES (
      p_supplier_id,
      p_change_type,
      p_change_title,
      p_change_description,
      v_old_data,
      v_new_data,
      v_changed_fields,
      p_author_id,
      p_author_name
    ) RETURNING id INTO v_log_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'supplier', v_new_data,
    'changed_fields', v_changed_fields,
    'log_id', v_log_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;
